import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  CCIPContractUpdated,
  CrossChainTransferInitiated,
  FeesWithdrawn,
  OwnershipTransferred,
  Paused,
  PriceFeedUsed,
  TokenAdded,
  TokenRemoved,
  TransactionCompleted,
  TransactionInitiated,
  TransactionRefunded,
  Unpaused
} from "../generated/FiatBridge/FiatBridge"

export function createCCIPContractUpdatedEvent(
  oldContract: Address,
  newContract: Address
): CCIPContractUpdated {
  let ccipContractUpdatedEvent = changetype<CCIPContractUpdated>(newMockEvent())

  ccipContractUpdatedEvent.parameters = new Array()

  ccipContractUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldContract",
      ethereum.Value.fromAddress(oldContract)
    )
  )
  ccipContractUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newContract",
      ethereum.Value.fromAddress(newContract)
    )
  )

  return ccipContractUpdatedEvent
}

export function createCrossChainTransferInitiatedEvent(
  messageId: Bytes,
  user: Address,
  destinationChain: BigInt,
  token: Address,
  amount: BigInt
): CrossChainTransferInitiated {
  let crossChainTransferInitiatedEvent =
    changetype<CrossChainTransferInitiated>(newMockEvent())

  crossChainTransferInitiatedEvent.parameters = new Array()

  crossChainTransferInitiatedEvent.parameters.push(
    new ethereum.EventParam(
      "messageId",
      ethereum.Value.fromFixedBytes(messageId)
    )
  )
  crossChainTransferInitiatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  crossChainTransferInitiatedEvent.parameters.push(
    new ethereum.EventParam(
      "destinationChain",
      ethereum.Value.fromUnsignedBigInt(destinationChain)
    )
  )
  crossChainTransferInitiatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  crossChainTransferInitiatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return crossChainTransferInitiatedEvent
}

export function createFeesWithdrawnEvent(
  token: Address,
  amount: BigInt
): FeesWithdrawn {
  let feesWithdrawnEvent = changetype<FeesWithdrawn>(newMockEvent())

  feesWithdrawnEvent.parameters = new Array()

  feesWithdrawnEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  feesWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return feesWithdrawnEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createPriceFeedUsedEvent(
  aggregator: Address,
  price: BigInt
): PriceFeedUsed {
  let priceFeedUsedEvent = changetype<PriceFeedUsed>(newMockEvent())

  priceFeedUsedEvent.parameters = new Array()

  priceFeedUsedEvent.parameters.push(
    new ethereum.EventParam(
      "aggregator",
      ethereum.Value.fromAddress(aggregator)
    )
  )
  priceFeedUsedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromSignedBigInt(price))
  )

  return priceFeedUsedEvent
}

export function createTokenAddedEvent(token: Address): TokenAdded {
  let tokenAddedEvent = changetype<TokenAdded>(newMockEvent())

  tokenAddedEvent.parameters = new Array()

  tokenAddedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return tokenAddedEvent
}

export function createTokenRemovedEvent(token: Address): TokenRemoved {
  let tokenRemovedEvent = changetype<TokenRemoved>(newMockEvent())

  tokenRemovedEvent.parameters = new Array()

  tokenRemovedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return tokenRemovedEvent
}

export function createTransactionCompletedEvent(
  txId: Bytes,
  amountSpent: BigInt
): TransactionCompleted {
  let transactionCompletedEvent =
    changetype<TransactionCompleted>(newMockEvent())

  transactionCompletedEvent.parameters = new Array()

  transactionCompletedEvent.parameters.push(
    new ethereum.EventParam("txId", ethereum.Value.fromFixedBytes(txId))
  )
  transactionCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "amountSpent",
      ethereum.Value.fromUnsignedBigInt(amountSpent)
    )
  )

  return transactionCompletedEvent
}

export function createTransactionInitiatedEvent(
  txId: Bytes,
  user: Address,
  amount: BigInt
): TransactionInitiated {
  let transactionInitiatedEvent =
    changetype<TransactionInitiated>(newMockEvent())

  transactionInitiatedEvent.parameters = new Array()

  transactionInitiatedEvent.parameters.push(
    new ethereum.EventParam("txId", ethereum.Value.fromFixedBytes(txId))
  )
  transactionInitiatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  transactionInitiatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return transactionInitiatedEvent
}

export function createTransactionRefundedEvent(
  txId: Bytes,
  amountRefunded: BigInt
): TransactionRefunded {
  let transactionRefundedEvent = changetype<TransactionRefunded>(newMockEvent())

  transactionRefundedEvent.parameters = new Array()

  transactionRefundedEvent.parameters.push(
    new ethereum.EventParam("txId", ethereum.Value.fromFixedBytes(txId))
  )
  transactionRefundedEvent.parameters.push(
    new ethereum.EventParam(
      "amountRefunded",
      ethereum.Value.fromUnsignedBigInt(amountRefunded)
    )
  )

  return transactionRefundedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
