import { BigInt, Address } from "@graphprotocol/graph-ts";

import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
} from "../generated/zkMP/zkMP";
import {
  ItemBought,
  ActiveItem,
  ItemCanceled,
  ItemListed,
} from "../generated/schema";

export function handleItemBought(event: ItemBoughtEvent): void {
  let entity = ItemBought.load(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  if (!entity) {
    entity = new ItemBought(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
  }

  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );

  entity.buyer = event.params.buyer;
  entity.nftAddress = event.params.nftAddress;
  entity.tokenId = event.params.tokenId;
  entity.price = event.params.price;
  activeItem!.buyer = event.params.buyer;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let entity = ItemCanceled.load(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  if (!entity) {
    entity = new ItemCanceled(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
  }

  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );

  entity.seller = event.params.seller;
  entity.nftAddress = event.params.nftAddress;
  entity.tokenId = event.params.tokenId;
  activeItem!.buyer = new BigInt(0);

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleItemListed(event: ItemListedEvent): void {
  let entity = ItemListed.load(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  if (!entity) {
    entity = new ItemListed(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
  }

  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );

  if (!activeItem) {
    activeItem = new ActiveItem(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }

  entity.seller = event.params.seller;
  activeItem!.seller = event.params.seller;

  entity.nftAddress = event.params.nftAddress;
  activeItem!.nftAddress = event.params.nftAddress;

  entity.tokenId = event.params.tokenId;
  activeItem!.tokenId = event.params.tokenId;

  entity.price = event.params.price;
  activeItem!.price = event.params.price;

  activeItem!.buyer = new BigInt(0);

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
  activeItem!.save();
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString();
}
