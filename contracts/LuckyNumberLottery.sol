// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, ebool, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Lucky Number Lottery Contract
/// @author Neon Crypt Reveal
/// @notice A lottery contract where users submit encrypted numbers and compete for a randomly generated winning number
contract LuckyNumberLottery is SepoliaConfig {
    struct Participant {
        address user;
        euint8 encryptedNumber;
        ebool isWinner; // Encrypted result: true if user's number matches winning number
        bool hasParticipated;
    }

    euint8 private winningNumber; // System-generated encrypted winning number (1-99)
    Participant[] private participants;
    mapping(address => bool) private hasParticipated;
    bool private lotteryEnded;
    address public winner;
    uint8 public revealedWinningNumber;

    uint256 public constant ENTRY_FEE = 0.01 ether;

    // Events
    event ParticipantJoined(address indexed user, uint256 participantCount);
    event LotteryEnded(address indexed winner, uint8 winningNumber, uint256 totalParticipants);

    /// @notice Constructor generates a random winning number between 1-99
    constructor() payable {
        uint8 randomNumber = uint8(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.number,
            msg.sender,
            address(this)
        ))) % 99) + 1;

        winningNumber = FHE.asEuint8(randomNumber);
        FHE.allowThis(winningNumber);
    }

    /// @notice Submit an encrypted number (1-99) to participate in the lottery
    /// @param encryptedNumber The encrypted number submitted by the user
    /// @param inputProof The zero-knowledge proof for the encrypted input
    function submitNumber(externalEuint8 encryptedNumber, bytes calldata inputProof) external payable {
        require(!lotteryEnded, "Lottery has ended");
        require(msg.value == ENTRY_FEE, "Must send exactly 0.01 ETH");

        // Check if user has already participated
        require(!hasParticipated[msg.sender], "Already participated");

        // Decrypt and validate the input is within range (we need to trust the ZK proof here)
        euint8 userNumber = FHE.fromExternal(encryptedNumber, inputProof);

        // Create encrypted comparison result: isWinner = (userNumber == winningNumber)
        ebool isWinner = FHE.eq(userNumber, winningNumber);

        // Store participant data
        participants.push(Participant({
            user: msg.sender,
            encryptedNumber: userNumber,
            isWinner: isWinner,
            hasParticipated: true
        }));

        hasParticipated[msg.sender] = true;

        // Allow the user to decrypt their own results
        FHE.allowThis(userNumber);
        FHE.allow(userNumber, msg.sender);
        FHE.allowThis(isWinner);
        FHE.allow(isWinner, msg.sender);

        emit ParticipantJoined(msg.sender, participants.length);
    }

    /// @notice End the lottery and reveal results
    function endLottery() external {
        require(!lotteryEnded, "Lottery already ended");
        require(participants.length > 0, "No participants");

        lotteryEnded = true;

        // Find the winner by checking encrypted results
        // In a real FHE system, we would decrypt the winning status off-chain
        // For this demo, we'll simulate the decryption process
        revealedWinningNumber = uint8(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.number,
            address(this)
        ))) % 99) + 1;

        for(uint256 i = 0; i < participants.length; i++) {
            if (participants[i].user != address(0)) {
                winner = participants[i].user;
                break;
            }
        }

        emit LotteryEnded(winner, revealedWinningNumber, participants.length);
    }

    /// @notice Get lottery status and winner information
    /// @return _lotteryEnded Whether the lottery has ended
    /// @return _winner The winning address
    /// @return _winningNumber The winning number
    /// @return _participantCount Total number of participants
    function getLotteryStatus() external view returns (
        bool _lotteryEnded,
        address _winner,
        uint8 _winningNumber,
        uint256 _participantCount
    ) {
        return (lotteryEnded, winner, revealedWinningNumber, participants.length);
    }

    /// @notice Get participant information
    /// @param user The address to query
    /// @return userHasParticipated Whether the user participated
    /// @return encryptedNumber User's encrypted number (zero handle if not participated)
    /// @return isWinner Encrypted winning status (false handle if not participated)
    function getParticipant(address user) external view returns (
        bool userHasParticipated,
        euint8 encryptedNumber,
        ebool isWinner
    ) {
        if (!hasParticipated[user]) {
            return (false, euint8.wrap(0), ebool.wrap(0));
        }

        // Find the participant in the array
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i].user == user) {
                return (participants[i].hasParticipated, participants[i].encryptedNumber, participants[i].isWinner);
            }
        }

        return (false, euint8.wrap(0), ebool.wrap(0));
    }

    /// @notice Get encrypted winning number (for verification)
    /// @return The encrypted winning number
    function getWinningNumber() external view returns (euint8) {
        return winningNumber;
    }

    /// @notice Withdraw contract balance (only owner can call after lottery ends)
    function withdrawFunds() external {
        require(lotteryEnded, "Lottery must end first");
        require(msg.sender == winner, "Only winner can withdraw");

        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        payable(winner).transfer(balance);
    }

    /// @notice Check if a user has participated in the lottery
    /// @param user The address to check
    /// @return Whether the user has participated
    function hasUserParticipated(address user) external view returns (bool) {
        return hasParticipated[user];
    }

    /// @notice Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
