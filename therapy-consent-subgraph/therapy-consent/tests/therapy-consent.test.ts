import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { ConsentUpdated } from "../generated/schema"
import { ConsentUpdated as ConsentUpdatedEvent } from "../generated/TherapyConsent/TherapyConsent"
import { handleConsentUpdated } from "../src/therapy-consent"
import { createConsentUpdatedEvent } from "./therapy-consent-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let consentType = "Example string value"
    let value = "boolean Not implemented"
    let newConsentUpdatedEvent = createConsentUpdatedEvent(
      user,
      consentType,
      value
    )
    handleConsentUpdated(newConsentUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ConsentUpdated created and stored", () => {
    assert.entityCount("ConsentUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ConsentUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ConsentUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "consentType",
      "Example string value"
    )
    assert.fieldEquals(
      "ConsentUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "value",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
