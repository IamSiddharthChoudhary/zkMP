// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./IzkNFT.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error ItemNotForSale(address nftAddress, uint256 tokenId);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NoProceeds();
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();

contract NftMarketplace is ReentrancyGuard{
    struct Listing {
        uint256 price;
        string seller;
    }

    event ItemListed(
        string indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(
        string indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event ItemBought(
        string indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(string => uint256) private s_proceeds;

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
        string memory spenderNul
    ) {
        IZkNFT nft = IZkNFT(nftAddress);
        string memory ownerNul = nft.ownerOf(tokenId);
        if (keccak256(abi.encodePacked(spenderNul)) != keccak256(abi.encodePacked(ownerNul))) {
            revert NotOwner();
        } 
        _;
    }

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        string memory nul
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, nul)
    {
        if (price <= 0) {
            revert PriceMustBeAboveZero();
        }
        IZkNFT nft = IZkNFT(nftAddress);
        if (nft.getApprovedAdd(tokenId) != address(this)) {
            revert NotApprovedForMarketplace();
        }
        s_listings[nftAddress][tokenId] = Listing(price, nul);
        emit ItemListed(nul, nftAddress, tokenId, price);
    }

    function cancelListing(address nftAddress, uint256 tokenId, string memory nul)
        external
        isOwner(nftAddress, tokenId, nul)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(nul, nftAddress, tokenId);
    }

    function buyItem(address nftAddress, uint256 tokenId, string memory nul)
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
        IZkNFT(nftAddress).transferNFT(tokenId,nul,msg.sender);
        emit ItemBought(nul, nftAddress, tokenId, listedItem.price);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice,
        string memory nul
    )
        external
        isListed(nftAddress, tokenId)
        nonReentrant
        isOwner(nftAddress, tokenId, nul)
    {
        if (newPrice <= 0) {
            revert PriceMustBeAboveZero();
        }
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(nul, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds(string memory nul) external {
        uint256 proceeds = s_proceeds[nul];
        if (proceeds <= 0) {
            revert NoProceeds();
        }
        s_proceeds[nul] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        require(success, "Transfer failed");
    }

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(string memory sellerNul) external view returns (uint256) {
        return s_proceeds[sellerNul];
    }
}