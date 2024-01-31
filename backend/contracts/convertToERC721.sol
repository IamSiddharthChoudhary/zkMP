// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./InewBasicNft.sol";

contract ConvertToERC721 is INewBasicNFT, ERC721{

    uint256 public tokenCounter;
    mapping(uint256=>string) private tokenIDtoURI;

    constructor(string memory str1, string memory str2) ERC721(str1,str2){
        tokenCounter = 0;
    }

    function tokenURI(uint256 tokenID) public override view returns(string memory){
        return tokenIDtoURI[tokenID];
    }

    function mintNft(string memory uri) public override {
        tokenIDtoURI[tokenCounter] = uri;
        tokenCounter++;
    } 
}