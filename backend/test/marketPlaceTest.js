const { assert, expect } = require("chai");
const web3 = require("web3");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Unit Tests", function () {
      let nftMarketplace, nftMarketplaceContract, basicNft, basicNftContract;
      const PRICE = web3.utils.toWei("0.1", "ether");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        nftMarketplaceContract = await ethers.getContract("NftMarketplace");
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        NftContract = await ethers.getContract("CreateNFT");
        Nft = NftContract.connect(deployer);
        await Nft.mintNFT(
          "https://black-potential-lemming-360.mypinata.cloud/ipfs/QmbkZ4ELT6VTUevK9FnPsNGW6mN92VaFYHxWE14qAAN1GV"
        );
        await Nft.approve(nftMarketplaceContract.getAddress(), TOKEN_ID);
      });

      describe("listItem", function () {
        it("Updates listing with seller and price", async function () {
          await nftMarketplace.listItem(Nft.getAddress(), TOKEN_ID, PRICE);
          const listing = await nftMarketplace.getListing(
            Nft.getAddress(),
            TOKEN_ID
          );
          assert(listing.price.toString() == PRICE.toString());
          assert(listing.seller.toString() == deployer.address);
        });
      });
    });
