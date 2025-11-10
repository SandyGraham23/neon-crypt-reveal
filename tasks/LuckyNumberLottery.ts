import { task } from "hardhat/config";

task("lottery:participate", "Participate in the lucky number lottery")
  .addParam("number", "The lucky number to submit (1-99)")
  .setAction(async (taskArgs, hre) => {
    const { ethers, fhevm } = hre;
    const { number } = taskArgs;

    if (number < 1 || number > 99) {
      throw new Error("Number must be between 1 and 99");
    }

    const [signer] = await ethers.getSigners();
    console.log(`Participating with number: ${number} from address: ${signer.address}`);

    // Get contract
    const lottery = await ethers.getContractAt("LuckyNumberLottery", (await hre.deployments.get("LuckyNumberLottery")).address);

    // Check if lottery has ended
    const [lotteryEnded] = await lottery.getLotteryStatus();
    if (lotteryEnded) {
      throw new Error("Lottery has already ended");
    }

    // Check if already participated
    const hasParticipated = await lottery.hasUserParticipated(signer.address);
    if (hasParticipated) {
      throw new Error("Already participated in this lottery");
    }

    console.log("Encrypting number...");
    const encryptedNumber = await fhevm
      .createEncryptedInput(await lottery.getAddress(), signer.address)
      .add8(number)
      .encrypt();

    console.log("Submitting encrypted number...");
    const tx = await lottery.submitNumber(encryptedNumber.handles[0], encryptedNumber.inputProof, {
      value: ethers.parseEther("0.01")
    });

    await tx.wait();
    console.log(`Successfully participated! Transaction hash: ${tx.hash}`);

    const [, , , participantCount] = await lottery.getLotteryStatus();
    console.log(`Total participants now: ${participantCount}`);
  });

task("lottery:status", "Check lottery status")
  .setAction(async (_, hre) => {
    const { ethers } = hre;

    const lottery = await ethers.getContractAt("LuckyNumberLottery", (await hre.deployments.get("LuckyNumberLottery")).address);

    const [lotteryEnded, winner, winningNumber, participantCount] = await lottery.getLotteryStatus();
    const balance = await lottery.getContractBalance();

    console.log("=== Lottery Status ===");
    console.log(`Lottery Ended: ${lotteryEnded}`);
    console.log(`Winner: ${winner}`);
    console.log(`Winning Number: ${winningNumber}`);
    console.log(`Total Participants: ${participantCount}`);
    console.log(`Prize Pool: ${ethers.formatEther(balance)} ETH`);
  });

task("lottery:end", "End the lottery and reveal winner")
  .setAction(async (_, hre) => {
    const { ethers } = hre;

    const lottery = await ethers.getContractAt("LuckyNumberLottery", (await hre.deployments.get("LuckyNumberLottery")).address);

    const [lotteryEnded] = await lottery.getLotteryStatus();
    if (lotteryEnded) {
      throw new Error("Lottery has already ended");
    }

    console.log("Ending lottery...");
    const tx = await lottery.endLottery();
    await tx.wait();
    console.log(`Lottery ended! Transaction hash: ${tx.hash}`);

    // Check final status
    const [ended, winner, winningNumber, participantCount] = await lottery.getLotteryStatus();
    console.log("\n=== Final Results ===");
    console.log(`Winner: ${winner}`);
    console.log(`Winning Number: ${winningNumber}`);
    console.log(`Total Participants: ${participantCount}`);
  });

task("lottery:withdraw", "Withdraw prize money (winner only)")
  .setAction(async (_, hre) => {
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    const lottery = await ethers.getContractAt("LuckyNumberLottery", (await hre.deployments.get("LuckyNumberLottery")).address);

    const [lotteryEnded, winner] = await lottery.getLotteryStatus();
    if (!lotteryEnded) {
      throw new Error("Lottery has not ended yet");
    }

    if (winner.toLowerCase() !== signer.address.toLowerCase()) {
      throw new Error("Only the winner can withdraw funds");
    }

    console.log("Withdrawing prize money...");
    const balance = await ethers.provider.getBalance(signer.address);
    console.log(`Balance before withdrawal: ${ethers.formatEther(balance)} ETH`);

    const tx = await lottery.withdrawFunds();
    await tx.wait();

    const newBalance = await ethers.provider.getBalance(signer.address);
    console.log(`Balance after withdrawal: ${ethers.formatEther(newBalance)} ETH`);
    console.log(`Prize withdrawn! Transaction hash: ${tx.hash}`);
  });
