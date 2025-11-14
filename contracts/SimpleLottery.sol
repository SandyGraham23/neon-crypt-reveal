// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Simple Lottery Contract (Non-FHE version for testing)
/// @author Neon Crypt Reveal
/// @notice A simple lottery contract to test basic functionality
contract SimpleLottery {
    struct Participant {
        address user;
        uint8 number;
        bool hasParticipated;
    }

    uint8 public winningNumber;
    Participant[] public participants;
    mapping(address => bool) public hasParticipated;
    bool public lotteryEnded;
    address public winner;

    uint256 public constant ENTRY_FEE = 0.01 ether;

    event ParticipantJoined(address indexed user, uint8 number);
    event LotteryEnded(address indexed winner, uint8 winningNumber, uint256 totalParticipants);

    constructor() payable {
        // Generate a simple random winning number
        winningNumber = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.number))) % 99) + 1;
    }

    /// @notice Submit a number to participate in the lottery
    /// @param number The lucky number (1-99)
    function submitNumber(uint8 number) external payable {
        require(!lotteryEnded, "Lottery has ended");
        require(msg.value == ENTRY_FEE, "Must send exactly 0.01 ETH");
        require(!hasParticipated[msg.sender], "Already participated");
        require(number >= 1 && number <= 99, "Number must be between 1 and 99");

        participants.push(Participant({
            user: msg.sender,
            number: number,
            hasParticipated: true
        }));

        hasParticipated[msg.sender] = true;

        emit ParticipantJoined(msg.sender, number);
    }

    /// @notice End the lottery and select winner
    function endLottery() external {
        require(!lotteryEnded, "Lottery has already ended");
        require(participants.length > 0, "No participants");

        lotteryEnded = true;

        // Find winner
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i].number == winningNumber) {
                winner = participants[i].user;
                break;
            }
        }

        emit LotteryEnded(winner, winningNumber, participants.length);
    }

    /// @notice Get lottery status
    function getLotteryStatus() external view returns (
        bool _lotteryEnded,
        address _winner,
        uint8 _winningNumber,
        uint256 _participantCount
    ) {
        return (lotteryEnded, winner, winningNumber, participants.length);
    }

    /// @notice Get participant info
    function getParticipant(uint256 index) external view returns (
        address user,
        uint8 number,
        bool participated
    ) {
        require(index < participants.length, "Index out of bounds");
        Participant memory p = participants[index];
        return (p.user, p.number, p.hasParticipated);
    }

    /// @notice Withdraw prize money (winner only)
    function withdrawFunds() external {
        require(lotteryEnded, "Lottery must end first");
        require(msg.sender == winner, "Only winner can withdraw");

        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        payable(winner).transfer(balance);
    }

    /// @notice Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
