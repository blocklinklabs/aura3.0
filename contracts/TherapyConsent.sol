// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract TherapyConsent {
    // NFT basics
    string public name = "TherapySessionNFT";
    string public symbol = "THERAPY";
    
    uint256 private _tokenIds;
    address public owner;
    
    // Mappings for NFT functionality
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(uint256 => string) private _tokenURIs;
    
    // Therapy specific structs
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
    
    // Mappings for therapy data
    mapping(address => Consent) public userConsent;
    mapping(address => AuditLog[]) public userAuditLogs;
    mapping(uint256 => TherapySession) public sessions;
    mapping(address => uint256[]) public userSessions;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ConsentUpdated(address indexed user, string consentType, bool value);
    event InterventionLogged(address indexed user, string interventionType, string outcome);
    event SessionNFTMinted(address indexed user, uint256 indexed tokenId, uint256 sessionId);
    event TherapySessionCreated(uint256 indexed sessionId, address indexed user);
    event TherapySessionCompleted(uint256 indexed sessionId, address indexed user);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorized(address user) {
        require(msg.sender == user, "Unauthorized");
        _;
    }

    // NFT Core functions
    function balanceOf(address user) public view returns (uint256) {
        require(user != address(0), "Zero address");
        return _balances[user];
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token doesn't exist");
        return owner;
    }
    
    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner, "Not token owner");
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "Token doesn't exist");
        return _tokenApprovals[tokenId];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved");
        require(ownerOf(tokenId) == from, "Not owner");
        require(to != address(0), "Zero address");
        
        _tokenApprovals[tokenId] = address(0);
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }

    // Therapy Session NFT functions
    function mintSessionNFT(
        address user,
        string memory sessionURI,
        TherapySession memory sessionData
    ) external returns (uint256) {
        require(msg.sender == user || msg.sender == owner, "Unauthorized");
        require(sessionData.completed, "Session not completed");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(user, newTokenId);
        _setTokenURI(newTokenId, sessionURI);
        
        sessions[newTokenId] = sessionData;
        userSessions[user].push(newTokenId);

        emit SessionNFTMinted(user, newTokenId, sessionData.sessionId);
        
        return newTokenId;
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Zero address");
        require(_owners[tokenId] == address(0), "Token already exists");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_owners[tokenId] != address(0), "Token doesn't exist");
        _tokenURIs[tokenId] = uri;
    }
    
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token doesn't exist");
        return _tokenURIs[tokenId];
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender);
    }

    // Therapy Session Management
    function createTherapySession(
        address user,
        uint256 sessionId,
        string[] memory initialTopics
    ) external {
        require(msg.sender == user || msg.sender == owner, "Unauthorized");
        
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

    // View functions
    function getUserSessions(address user) external view returns (uint256[] memory) {
        return userSessions[user];
    }

    function getSessionDetails(uint256 sessionId) external view returns (TherapySession memory) {
        return sessions[sessionId];
    }
    
    // Consent Management
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
    
    // Audit Logging
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
