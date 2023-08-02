import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { ItemBought, ItemCanceled, ItemListed } from "../generated/zkMP/zkMP"

export function createItemBoughtEvent(
  buyer: string,
  nftAddress: Address,
  tokenId: BigInt,
  price: BigInt
): ItemBought {
  let itemBoughtEvent = changetype<ItemBought>(newMockEvent())

  itemBoughtEvent.parameters = new Array()

  itemBoughtEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromString(buyer))
  )
  itemBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  itemBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  itemBoughtEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return itemBoughtEvent
}

export function createItemCanceledEvent(
  seller: string,
  nftAddress: Address,
  tokenId: BigInt
): ItemCanceled {
  let itemCanceledEvent = changetype<ItemCanceled>(newMockEvent())

  itemCanceledEvent.parameters = new Array()

  itemCanceledEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromString(seller))
  )
  itemCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  itemCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return itemCanceledEvent
}

export function createItemListedEvent(
  seller: string,
  nftAddress: Address,
  tokenId: BigInt,
  price: BigInt
): ItemListed {
  let itemListedEvent = changetype<ItemListed>(newMockEvent())

  itemListedEvent.parameters = new Array()

  itemListedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromString(seller))
  )
  itemListedEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  itemListedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  itemListedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return itemListedEvent
}
