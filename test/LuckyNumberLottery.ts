import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { LuckyNumberLottery, LuckyNumberLottery__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("LuckyNumberLottery")) as LuckyNumberLottery__factory;
  const lotteryContract = (await factory.deploy({ value: ethers.parseEther("0.1") })) as LuckyNumberLottery;
  const lotteryContractAddress = await lotteryContract.getAddress();

  return { lotteryContract, lotteryContractAddress };
}

describe("LuckyNumberLottery", function () {
  let signers: Signers;
  let lotteryContract: LuckyNumberLottery;
  let lotteryContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2], charlie: ethSigners[3] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ lotteryContract, lotteryContractAddress } = await deployFixture());
  });

  it("should deploy with initial contract balance", async function () {
    const balance = await lotteryContract.getContractBalance();
    expect(balance).to.be.gt(0);
  });

  it("should allow user to submit encrypted number", async function () {
    const userNumber = 42;

    // Encrypt the number
    const encryptedNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.alice.address)
      .add8(userNumber)
      .encrypt();

    // Submit the encrypted number
    const tx = await lotteryContract
      .connect(signers.alice)
      .submitNumber(encryptedNumber.handles[0], encryptedNumber.inputProof, { value: ethers.parseEther("0.01") });
    await tx.wait();

    // Check participant was added
    const [, , , participantCount] = await lotteryContract.getLotteryStatus();
    expect(participantCount).to.eq(1);

    // Check user participation status
    const hasParticipated = await lotteryContract.hasUserParticipated(signers.alice.address);
    expect(hasParticipated).to.be.true;

    const balance = await lotteryContract.getContractBalance();
    expect(balance).to.be.gt(ethers.parseEther("0.01"));
  });

  it("should not allow duplicate participation", async function () {
    const userNumber = 25;

    const encryptedNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.alice.address)
      .add8(userNumber)
      .encrypt();

    // First submission should succeed
    await lotteryContract
      .connect(signers.alice)
      .submitNumber(encryptedNumber.handles[0], encryptedNumber.inputProof, { value: ethers.parseEther("0.01") });

    // Second submission should fail
    await expect(
      lotteryContract
        .connect(signers.alice)
        .submitNumber(encryptedNumber.handles[0], encryptedNumber.inputProof, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWith("Already participated");
  });

  it("should require exact entry fee", async function () {
    const userNumber = 15;

    const encryptedNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.alice.address)
      .add8(userNumber)
      .encrypt();

    // Should fail with insufficient fee
    await expect(
      lotteryContract
        .connect(signers.alice)
        .submitNumber(encryptedNumber.handles[0], encryptedNumber.inputProof, { value: ethers.parseEther("0.005") })
    ).to.be.revertedWith("Must send exactly 0.01 ETH");

    // Should fail with excessive fee
    await expect(
      lotteryContract
        .connect(signers.alice)
        .submitNumber(encryptedNumber.handles[0], encryptedNumber.inputProof, { value: ethers.parseEther("0.02") })
    ).to.be.revertedWith("Must send exactly 0.01 ETH");
  });

  it("should handle multiple participants", async function () {
    // Alice participates
    const aliceNumber = 7;
    const encryptedAliceNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.alice.address)
      .add8(aliceNumber)
      .encrypt();

    await lotteryContract
      .connect(signers.alice)
      .submitNumber(encryptedAliceNumber.handles[0], encryptedAliceNumber.inputProof, { value: ethers.parseEther("0.01") });

    // Bob participates
    const bobNumber = 23;
    const encryptedBobNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.bob.address)
      .add8(bobNumber)
      .encrypt();

    await lotteryContract
      .connect(signers.bob)
      .submitNumber(encryptedBobNumber.handles[0], encryptedBobNumber.inputProof, { value: ethers.parseEther("0.01") });

    // Charlie participates
    const charlieNumber = 42;
    const encryptedCharlieNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.charlie.address)
      .add8(charlieNumber)
      .encrypt();

    await lotteryContract
      .connect(signers.charlie)
      .submitNumber(encryptedCharlieNumber.handles[0], encryptedCharlieNumber.inputProof, { value: ethers.parseEther("0.01") });

    // Check total participants
    const [, , , participantCount] = await lotteryContract.getLotteryStatus();
    expect(participantCount).to.eq(3);

    // Check contract balance
    const balance = await lotteryContract.getContractBalance();
    expect(balance).to.be.gte(ethers.parseEther("0.03"));
  });

  it("should end lottery and select winner", async function () {
    // Add multiple participants
    const participants = [
      { signer: signers.alice, number: 7 },
      { signer: signers.bob, number: 23 },
      { signer: signers.charlie, number: 42 }
    ];

    for (const participant of participants) {
      const encryptedNumber = await fhevm
        .createEncryptedInput(lotteryContractAddress, participant.signer.address)
        .add8(participant.number)
        .encrypt();

      await lotteryContract
        .connect(participant.signer)
        .submitNumber(encryptedNumber.handles[0], encryptedNumber.inputProof, { value: ethers.parseEther("0.01") });
    }

    // End lottery
    await lotteryContract.endLottery();

    // Check lottery status
    const [lotteryEnded, winner, winningNumber, participantCount] = await lotteryContract.getLotteryStatus();
    expect(lotteryEnded).to.be.true;
    expect(winner).to.not.eq(ethers.ZeroAddress);
    expect(winningNumber).to.be.gte(1);
    expect(winningNumber).to.be.lte(99);
    expect(participantCount).to.eq(3);
  });

  it("should not allow participation after lottery ends", async function () {
    // First add a participant
    const userNumber = 33;
    const encryptedNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.alice.address)
      .add8(userNumber)
      .encrypt();

    await lotteryContract
      .connect(signers.alice)
      .submitNumber(encryptedNumber.handles[0], encryptedNumber.inputProof, { value: ethers.parseEther("0.01") });

    // End lottery
    await lotteryContract.endLottery();

    // Try to participate after lottery ended
    const newUserNumber = 50;
    const newEncryptedNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.bob.address)
      .add8(newUserNumber)
      .encrypt();

    await expect(
      lotteryContract
        .connect(signers.bob)
        .submitNumber(newEncryptedNumber.handles[0], newEncryptedNumber.inputProof, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWith("Lottery has ended");
  });

  it("should allow winner to withdraw funds", async function () {
    // Alice participates
    const aliceNumber = 33;
    const encryptedAliceNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.alice.address)
      .add8(aliceNumber)
      .encrypt();

    await lotteryContract
      .connect(signers.alice)
      .submitNumber(encryptedAliceNumber.handles[0], encryptedAliceNumber.inputProof, { value: ethers.parseEther("0.01") });

    // End lottery
    await lotteryContract.endLottery();

    // Get winner
    const [lotteryEnded, winner] = await lotteryContract.getLotteryStatus();

    // Winner should be able to withdraw (in this test, Alice should win)
    const initialBalance = await ethers.provider.getBalance(winner);
    await lotteryContract.connect(await ethers.getSigner(winner)).withdrawFunds();
    const finalBalance = await ethers.provider.getBalance(winner);

    // Balance should increase (minus gas costs)
    expect(finalBalance).to.be.gt(initialBalance);
  });
});
