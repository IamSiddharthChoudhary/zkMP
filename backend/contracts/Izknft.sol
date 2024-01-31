//SPDX-License-Indentifier: MIT
pragma solidity ^0.8.7;

interface IZkNFT {
    
    function approve(uint256 _tokenID, address op) external;
    function getApprovedAdd(uint256 _tokenID) external view returns(address);    
    function ownerOf(uint256 _tokenID) external view returns (uint256);
    function transferNFT(uint256 _tokenID, uint256 nullifierHash, address buyer) external;
    function transferFrom(uint256 ownerNul, uint256 buyerNul, address buyer, uint256 _tokenID) external;
    function getTokenURI(uint256 _tokenID) external view returns(string memory);
    function name() external view  returns (string memory);
    function symbol() external view  returns (string memory);
    function deleteZkNft(uint256 tokenID, address owner) external;
}