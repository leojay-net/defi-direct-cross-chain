import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import { CCIPContractUpdated } from "../generated/schema"
import { CCIPContractUpdated as CCIPContractUpdatedEvent } from "../generated/FiatBridge/FiatBridge"
import { handleCCIPContractUpdated } from "../src/fiat-bridge"
import { createCCIPContractUpdatedEvent } from "./fiat-bridge-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let oldContract = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newContract = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newCCIPContractUpdatedEvent = createCCIPContractUpdatedEvent(
      oldContract,
      newContract
    )
    handleCCIPContractUpdated(newCCIPContractUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("CCIPContractUpdated created and stored", () => {
    assert.entityCount("CCIPContractUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CCIPContractUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "oldContract",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CCIPContractUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newContract",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
