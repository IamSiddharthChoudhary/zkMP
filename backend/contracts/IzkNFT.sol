// SPDX-License-Identifier: MIT;
pragma solidity ^0.8.7;

interface IZkNFT {
    
    function approve(uint256 _tokenID, address op) external;
    function getApprovedAdd(uint256 _tokenID) external view returns(address);    
    function ownerOf(uint256 _tokenID) external view returns (string memory);
    function transferNFT(uint256 _tokenID, string memory nullifierHash, address buyer) external;
    function transferFrom(string memory ownerNul, string memory buyerNul, address buyer, uint256 _tokenID) external;
}