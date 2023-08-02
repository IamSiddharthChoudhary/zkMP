import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
} from "../generated/zkMP/zkMP";
import {
  ItemListed,
  ActiveItem,
  ItemBought,
  ItemCanceled,
} from "../generated/schema";

export function handleItemListed(event: ItemListedEvent): void {
  let itemListed = ItemListed.load(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!itemListed) {
    itemListed = new ItemListed(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
  }
  if (!activeItem) {
    activeItem = new ActiveItem(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  itemListed.seller = bytesToString(event.params.seller);
  activeItem.seller = bytesToString(event.params.seller);

  itemListed.nftAddress = event.params.nftAddress;
  activeItem.nftAddress = event.params.nftAddress;

  itemListed.tokenId = event.params.tokenId;
  activeItem.tokenId = event.params.tokenId;

  itemListed.price = event.params.price;
  activeItem.price = event.params.price;

  activeItem.buyer = "0";

  itemListed.save();
  activeItem.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let itemCanceled = ItemCanceled.load(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!itemCanceled) {
    itemCanceled = new ItemCanceled(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
  }
  itemCanceled.seller = bytesToString(event.params.seller);
  itemCanceled.nftAddress = event.params.nftAddress;
  itemCanceled.tokenId = event.params.tokenId;
  activeItem!.buyer = "0";

  itemCanceled.save();
  activeItem!.save();
}

export function handleItemBought(event: ItemBoughtEvent): void {
  let itemBought = ItemBought.load(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!itemBought) {
    itemBought = new ItemBought(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
  }
  itemBought.buyer = bytesToString(event.params.buyer);
  itemBought.nftAddress = event.params.nftAddress;
  itemBought.tokenId = event.params.tokenId;
  activeItem!.buyer = bytesToString(event.params.buyer);

  itemBought.save();
  activeItem!.save();
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString();
}

function bytesToString(byt: Bytes): string {
  let result = "";
  for (let i = 0; i < byt.length; ++i) {
    const byte = byt[i];
    const text = byte.toString();
    result += (byte < 16 ? "%0" : "%") + text;
  }
  return decodeURIComponent(result);
}
