import {
  ConsentUpdated as ConsentUpdatedEvent,
  InterventionLogged as InterventionLoggedEvent,
} from "../generated/Contract/Contract";
import {
  ConsentUpdated,
  InterventionLogged,
  UserConsent,
  AuditLog,
} from "../generated/schema";

export function handleConsentUpdated(event: ConsentUpdatedEvent): void {
  let entity = new ConsentUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = event.params.user;
  entity.consentType = event.params.consentType;
  entity.value = event.params.value;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let userConsentId = event.params.user;
  let userConsent = UserConsent.load(userConsentId);
  if (!userConsent) {
    userConsent = new UserConsent(userConsentId);
    userConsent.aiInterventions = false;
    userConsent.emergencyContact = false;
    userConsent.dataSharing = false;
  }

  if (event.params.consentType == "ai_interventions") {
    userConsent.aiInterventions = event.params.value;
  } else if (event.params.consentType == "emergency_contact") {
    userConsent.emergencyContact = event.params.value;
  } else if (event.params.consentType == "data_sharing") {
    userConsent.dataSharing = event.params.value;
  }

  userConsent.lastUpdated = event.block.timestamp;
  userConsent.save();
}

export function handleInterventionLogged(event: InterventionLoggedEvent): void {
  let entity = new InterventionLogged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = event.params.user;
  entity.interventionType = event.params.interventionType;
  entity.outcome = event.params.outcome;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let auditLogId = event.transaction.hash.concatI32(event.logIndex.toI32());
  let auditLog = new AuditLog(auditLogId);
  auditLog.user = event.params.user;
  auditLog.interventionType = event.params.interventionType;
  auditLog.timestamp = event.block.timestamp;
  auditLog.outcome = event.params.outcome;
  auditLog.save();
}
