import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  ConsentUpdated,
  InterventionLogged
} from "../generated/TherapyConsent/TherapyConsent"

export function createConsentUpdatedEvent(
  user: Address,
  consentType: string,
  value: boolean
): ConsentUpdated {
  let consentUpdatedEvent = changetype<ConsentUpdated>(newMockEvent())

  consentUpdatedEvent.parameters = new Array()

  consentUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  consentUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "consentType",
      ethereum.Value.fromString(consentType)
    )
  )
  consentUpdatedEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromBoolean(value))
  )

  return consentUpdatedEvent
}

export function createInterventionLoggedEvent(
  user: Address,
  interventionType: string,
  outcome: string
): InterventionLogged {
  let interventionLoggedEvent = changetype<InterventionLogged>(newMockEvent())

  interventionLoggedEvent.parameters = new Array()

  interventionLoggedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  interventionLoggedEvent.parameters.push(
    new ethereum.EventParam(
      "interventionType",
      ethereum.Value.fromString(interventionType)
    )
  )
  interventionLoggedEvent.parameters.push(
    new ethereum.EventParam("outcome", ethereum.Value.fromString(outcome))
  )

  return interventionLoggedEvent
}
