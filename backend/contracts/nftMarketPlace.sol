// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Izknft.sol";
import "./ImarketPlace.sol";
import "./InewBasicNft.sol";

error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error ItemNotForSale(address nftAddress, uint256 tokenId);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NoProceeds();
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();

contract NftMarketplace is ReentrancyGuard, INftMarketPlace{
    struct Listing {
        uint256 price;
        uint256 seller;
    }

    event ItemListed(
        uint256 seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(
        uint256 seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event ItemBought(
        uint256 buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemConverted(
        address zkNftAddress,
        uint256 indexed tokenID,
        address ercNftAddress
    );

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(uint256 => uint256) private s_proceeds;

    modifier notListed(
        address nftAddress,
        uint256 tokenId
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        uint256 spenderCom
    ) {
        IZkNFT nft = IZkNFT(nftAddress);
        uint256 ownerCom = nft.ownerOf(tokenId);
        if (spenderCom==ownerCom) {
            revert NotOwner();
        } 
        _;
    }

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        uint256 com
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, com)
    {
        if (price <= 0) {
            revert PriceMustBeAboveZero();
        }
        IZkNFT nft = IZkNFT(nftAddress);
        if (nft.getApprovedAdd(tokenId) != address(this)) {
            revert NotApprovedForMarketplace();
        }
        s_listings[nftAddress][tokenId] = Listing(price, com);
        emit ItemListed(com, nftAddress, tokenId, price);
    }

    function cancelListing(address nftAddress, uint256 tokenId, uint256 com)
        external
        isOwner(nftAddress, tokenId, com)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(com, nftAddress, tokenId);
    }

    function buyItem(address nftAddress, uint256 tokenId, uint256 com)
        external
        payable
        isListed(nftAddress, tokenId)
        nonReentrant
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IZkNFT(nftAddress).transferNFT(tokenId,com,msg.sender);
        emit ItemBought(com, nftAddress, tokenId, listedItem.price);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice,
        uint256 com
    )
        external
        isListed(nftAddress, tokenId)
        nonReentrant
        isOwner(nftAddress, tokenId, com)
    {
        if (newPrice <= 0) {
            revert PriceMustBeAboveZero();
        }
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(com, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds(uint256 com) override external {
        uint256 proceeds = s_proceeds[com];
        if (proceeds <= 0) {
            revert NoProceeds();
        }
        s_proceeds[com] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        require(success, "Transfer failed");
    }

    function convertToERC721(address zkNftAddress, address convertableNft,uint256 tokenId) public {
        string memory tokenURI = IZkNFT(zkNftAddress).getTokenURI(tokenId);
        IZkNFT(zkNftAddress).deleteZkNft(tokenId,msg.sender);

        INewBasicNFT(convertableNft).mintNft(tokenURI);

        emit ItemConverted(zkNftAddress,tokenId,convertableNft);
    }

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(uint256 sellerCom) external view returns (uint256) {
        return s_proceeds[sellerCom];
    }
}