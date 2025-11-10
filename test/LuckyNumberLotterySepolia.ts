import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { LuckyNumberLottery } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("LuckyNumberLotterySepolia", function () {
  let signers: Signers;
  let lotteryContract: LuckyNumberLottery;
  let lotteryContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const LotteryDeployment = await deployments.get("LuckyNumberLottery");
      lotteryContractAddress = LotteryDeployment.address;
      lotteryContract = await ethers.getContractAt("LuckyNumberLottery", LotteryDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should participate in lottery on Sepolia", async function () {
    steps = 8;

    this.timeout(4 * 40000);

    progress("Checking lottery status...");
    const initialStatus = await lotteryContract.getLotteryStatus();
    progress(`Initial status: ended=${initialStatus[0]}, participants=${initialStatus[3]}`);

    progress("Encrypting lucky number '42'...");
    const encryptedNumber = await fhevm
      .createEncryptedInput(lotteryContractAddress, signers.alice.address)
      .add8(42)
      .encrypt();

    progress(
      `Submitting encrypted number to lottery contract=${lotteryContractAddress} handle=${ethers.hexlify(encryptedNumber.handles[0])} signer=${signers.alice.address}...`,
    );
    const tx = await lotteryContract
      .connect(signers.alice)
      .submitNumber(encryptedNumber.handles[0], encryptedNumber.inputProof, { value: ethers.parseEther("0.01") });
    await tx.wait();

    progress("Verifying participation...");
    const hasParticipated = await lotteryContract.hasUserParticipated(signers.alice.address);
    expect(hasParticipated).to.be.true;

    progress("Checking updated participant count...");
    const finalStatus = await lotteryContract.getLotteryStatus();
    expect(finalStatus[3]).to.be.gt(initialStatus[3]); // participant count increased

    progress("Getting participant details...");
    const participant = await lotteryContract.getParticipant(signers.alice.address);
    expect(participant[0]).to.be.true; // hasParticipated

    progress("Test completed successfully!");
  });

  it("should check lottery status and winner", async function () {
    steps = 3;

    this.timeout(4 * 40000);

    progress("Checking lottery status...");
    const [lotteryEnded, winner, winningNumber, participantCount] = await lotteryContract.getLotteryStatus();

    progress(`Lottery status: ended=${lotteryEnded}, winner=${winner}, winningNumber=${winningNumber}, participants=${participantCount}`);

    if (lotteryEnded) {
      expect(winner).to.not.eq(ethers.ZeroAddress);
      expect(winningNumber).to.be.gte(1);
      expect(winningNumber).to.be.lte(99);
      expect(participantCount).to.be.gt(0);
    }

    progress("Test completed successfully!");
  });
});
