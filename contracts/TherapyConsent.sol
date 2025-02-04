// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@eigenlayer/contracts/interfaces/IServiceManager.sol";
import "@eigenlayer/contracts/permissions/ECDSAServiceManagerBase.sol";

contract TherapyServiceManager is ECDSAServiceManagerBase {
    using ECDSAUpgradeable for bytes32;

    struct TherapySession {
        address patient;
        string encryptedConversation;
        uint32 sessionStartBlock;
        bool isEmergency;
        bytes32 aiSignature;
    }

    mapping(uint256 => TherapySession) public sessions;
    mapping(address => uint256[]) public patientSessions;
    uint256 public latestSessionId;

    event NewSessionStarted(uint256 indexed sessionId, address indexed patient);
    event EmergencyTriggered(uint256 indexed sessionId, address indexed patient);
    event SessionCompleted(uint256 indexed sessionId, bytes32 aiSignature);

    function startNewSession(string memory initialMessage) external returns (TherapySession memory) {
        TherapySession memory newSession = TherapySession({
            patient: msg.sender,
            encryptedConversation: initialMessage,
            sessionStartBlock: uint32(block.number),
            isEmergency: false,
            aiSignature: bytes32(0)
        });

        sessions[latestSessionId] = newSession;
        patientSessions[msg.sender].push(latestSessionId);

        emit NewSessionStarted(latestSessionId, msg.sender);
        latestSessionId++;

        return newSession;
    }

    function updateSession(
        uint256 sessionId,
        string memory updatedConversation,
        bytes memory operatorSignature
    ) external {
        TherapySession storage session = sessions[sessionId];
        require(session.patient != address(0), "Session does not exist");
        
        // Verify operator signature
        bytes32 messageHash = keccak256(abi.encodePacked(sessionId, updatedConversation));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        bytes4 magicValue = IERC1271Upgradeable.isValidSignature.selector;
        require(
            magicValue == ECDSAStakeRegistry(stakeRegistry).isValidSignature(ethSignedMessageHash, operatorSignature),
            "Invalid operator signature"
        );

        session.encryptedConversation = updatedConversation;
    }

    function triggerEmergency(uint256 sessionId) external {
        TherapySession storage session = sessions[sessionId];
        require(session.patient == msg.sender, "Not session owner");
        
        session.isEmergency = true;
        emit EmergencyTriggered(sessionId, msg.sender);
    }
} 



