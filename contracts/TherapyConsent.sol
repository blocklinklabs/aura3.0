// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TherapyConsent is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Consent {
        bool aiInterventions;
        bool emergencyContact;
        bool dataSharing;
        uint256 lastUpdated;
    }
    
    struct AuditLog {
        string interventionType;
        uint256 timestamp;
        string outcome;
    }

    struct TherapySession {
        uint256 sessionId;
        uint256 timestamp;
        string summary;
        string[] topics;
        uint256 duration;
        uint8 moodScore;
        string[] achievements;
        bool completed;
    }
    
    mapping(address => Consent) public userConsent;
    mapping(address => AuditLog[]) public userAuditLogs;
    mapping(uint256 => TherapySession) public sessions;
    mapping(address => uint256[]) public userSessions;
    
    event ConsentUpdated(address indexed user, string consentType, bool value);
    event InterventionLogged(address indexed user, string interventionType, string outcome);
    event SessionNFTMinted(address indexed user, uint256 indexed tokenId, uint256 sessionId);
    event TherapySessionCreated(uint256 indexed sessionId, address indexed user);
    event TherapySessionCompleted(uint256 indexed sessionId, address indexed user);
    
    constructor() ERC721("TherapySessionNFT", "THERAPY") {}

    function mintSessionNFT(
        address user,
        string memory sessionURI,
        TherapySession memory sessionData
    ) external returns (uint256) {
        require(msg.sender == user || msg.sender == owner(), "Unauthorized");
        require(sessionData.completed, "Session not completed");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(user, newTokenId);
        _setTokenURI(newTokenId, sessionURI);
        
        sessions[newTokenId] = sessionData;
        userSessions[user].push(newTokenId);

        emit SessionNFTMinted(user, newTokenId, sessionData.sessionId);
        
        return newTokenId;
    }

    function createTherapySession(
        address user,
        uint256 sessionId,
        string[] memory initialTopics
    ) external {
        require(msg.sender == user || msg.sender == owner(), "Unauthorized");
        
        TherapySession memory newSession = TherapySession({
            sessionId: sessionId,
            timestamp: block.timestamp,
            summary: "",
            topics: initialTopics,
            duration: 0,
            moodScore: 0,
            achievements: new string[](0),
            completed: false
        });
        
        sessions[sessionId] = newSession;
        emit TherapySessionCreated(sessionId, user);
    }

    function completeTherapySession(
        uint256 sessionId,
        string memory summary,
        uint256 duration,
        uint8 moodScore,
        string[] memory achievements
    ) external {
        TherapySession storage session = sessions[sessionId];
        require(!session.completed, "Session already completed");
        
        session.summary = summary;
        session.duration = duration;
        session.moodScore = moodScore;
        session.achievements = achievements;
        session.completed = true;
        
        emit TherapySessionCompleted(sessionId, msg.sender);
    }

    function getUserSessions(address user) external view returns (uint256[] memory) {
        return userSessions[user];
    }

    function getSessionDetails(uint256 sessionId) external view returns (TherapySession memory) {
        return sessions[sessionId];
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    modifier onlyAuthorized(address user) {
        require(msg.sender == user, "Unauthorized");
        _;
    }
    
    function updateConsent(
        bool _aiInterventions,
        bool _emergencyContact,
        bool _dataSharing
    ) external {
        userConsent[msg.sender] = Consent({
            aiInterventions: _aiInterventions,
            emergencyContact: _emergencyContact,
            dataSharing: _dataSharing,
            lastUpdated: block.timestamp
        });
        
        emit ConsentUpdated(msg.sender, "ai_interventions", _aiInterventions);
        emit ConsentUpdated(msg.sender, "emergency_contact", _emergencyContact);
        emit ConsentUpdated(msg.sender, "data_sharing", _dataSharing);
    }
    
    function logIntervention(
        address user,
        string memory interventionType,
        string memory outcome
    ) external onlyAuthorized(user) {
        require(userConsent[user].aiInterventions, "AI interventions not authorized");
        
        userAuditLogs[user].push(AuditLog({
            interventionType: interventionType,
            timestamp: block.timestamp,
            outcome: outcome
        }));
        
        emit InterventionLogged(user, interventionType, outcome);
    }
    
    function getConsent(address user) external view returns (Consent memory) {
        return userConsent[user];
    }
    
    function getAuditLogs(address user) external view returns (AuditLog[] memory) {
        return userAuditLogs[user];
    }
}
