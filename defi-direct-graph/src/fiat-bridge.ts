import {
  CCIPContractUpdated as CCIPContractUpdatedEvent,
  CrossChainTransferInitiated as CrossChainTransferInitiatedEvent,
  FeesWithdrawn as FeesWithdrawnEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  PriceFeedUsed as PriceFeedUsedEvent,
  TokenAdded as TokenAddedEvent,
  TokenRemoved as TokenRemovedEvent,
  TransactionCompleted as TransactionCompletedEvent,
  TransactionInitiated as TransactionInitiatedEvent,
  TransactionRefunded as TransactionRefundedEvent,
  Unpaused as UnpausedEvent
} from "../generated/FiatBridge/FiatBridge"
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
} from "../generated/schema"

export function handleCCIPContractUpdated(
  event: CCIPContractUpdatedEvent
): void {
  let entity = new CCIPContractUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldContract = event.params.oldContract
  entity.newContract = event.params.newContract

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCrossChainTransferInitiated(
  event: CrossChainTransferInitiatedEvent
): void {
  let entity = new CrossChainTransferInitiated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.messageId = event.params.messageId
  entity.user = event.params.user
  entity.destinationChain = event.params.destinationChain
  entity.token = event.params.token
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeesWithdrawn(event: FeesWithdrawnEvent): void {
  let entity = new FeesWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePriceFeedUsed(event: PriceFeedUsedEvent): void {
  let entity = new PriceFeedUsed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.aggregator = event.params.aggregator
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenAdded(event: TokenAddedEvent): void {
  let entity = new TokenAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenRemoved(event: TokenRemovedEvent): void {
  let entity = new TokenRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransactionCompleted(
  event: TransactionCompletedEvent
): void {
  let entity = new TransactionCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.txId = event.params.txId
  entity.amountSpent = event.params.amountSpent

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransactionInitiated(
  event: TransactionInitiatedEvent
): void {
  let entity = new TransactionInitiated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.txId = event.params.txId
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransactionRefunded(
  event: TransactionRefundedEvent
): void {
  let entity = new TransactionRefunded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.txId = event.params.txId
  entity.amountRefunded = event.params.amountRefunded

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
