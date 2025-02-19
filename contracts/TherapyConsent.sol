// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract TherapyConsent {
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
    
    mapping(address => Consent) public userConsent;
    mapping(address => AuditLog[]) public userAuditLogs;
    
    event ConsentUpdated(address indexed user, string consentType, bool value);
    event InterventionLogged(address indexed user, string interventionType, string outcome);
    
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
