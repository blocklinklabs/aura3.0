import {
  ConsentUpdated as ConsentUpdatedEvent,
  InterventionLogged as InterventionLoggedEvent
} from "../generated/Contract/Contract"
import { ConsentUpdated, InterventionLogged } from "../generated/schema"

export function handleConsentUpdated(event: ConsentUpdatedEvent): void {
  let entity = new ConsentUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.consentType = event.params.consentType
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInterventionLogged(event: InterventionLoggedEvent): void {
  let entity = new InterventionLogged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.interventionType = event.params.interventionType
  entity.outcome = event.params.outcome

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
