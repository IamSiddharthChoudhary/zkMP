// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

import "./IzkNFT.sol";

contract zkNFT is IZkNFT{

    event NFTTransfered(string indexed from ,string indexed to ,uint256 indexed tokenID);
    event MetadataUpdate(uint256 indexed tokenID);

    mapping(address => mapping (uint256=> string)) private addToNullHsh;
    mapping(string => address) private nullToAdd;
    mapping(address => uint256) private noOfNullHshs; 
    mapping(uint256 => string) private owners;
    mapping(uint256 => string) private tokenURIs;
    mapping (uint256 => address) tokenIDToAdd;

    string _name = "zkMP";
    string _symbol = "Z";
    uint256 private tokenID;
    
    constructor(){
        tokenID = 0;
    }

    function createNFT(string memory nullifierHash, string memory tokenURI) public {
        address creator = msg.sender;

        setAddAndNull(creator,nullifierHash);
        mintNFT(nullifierHash,tokenURI);
        tokenID++;
    }

    function mintNFT(string memory nullifierHash,string memory _tokenURI) internal {
        owners[tokenID] = nullifierHash;
        setTokenURI(tokenID,_tokenURI);

        emit NFTTransfered("", nullifierHash, tokenID);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        tokenURIs[tokenId] = _tokenURI;

        emit MetadataUpdate(tokenId);
    }

    function transferFrom(string memory ownerNul, string memory buyerNul, address buyer, uint256 _tokenID) public override{

        require(getApprovedAdd(_tokenID) == msg.sender, "No approved to make this call");
        require(keccak256(abi.encodePacked(ownerOf(_tokenID))) == keccak256(abi.encodePacked(ownerNul)), "Invalid nullifier hash");

        transferNFT(_tokenID, buyerNul, buyer);
    }

    function transferNFT(uint256 _tokenID, string memory nullifierHash, address buyer) public override{
        // owner losing nft
        string memory crtrNullHsh = owners[_tokenID];
        address owner = nullToAdd[crtrNullHsh]; 
        delete owners[_tokenID];
        uint256 n = noOfNullHshs[owner] - 1;
        delete addToNullHsh[owner][n];
        noOfNullHshs[owner] -= 1 ;

        // Buyer getting nft
        setAddAndNull(buyer,nullifierHash);
        owners[_tokenID] = nullifierHash; 
    }   

    function ownerOf(uint256 _tokenID) public override view returns (string memory){
        return owners[_tokenID];
    }

    function exists(uint256 _tokenID) internal view returns (bool) {
        bytes memory strBytes = bytes(owners[_tokenID]);
        return strBytes.length == 0;
    }

    function setAddAndNull(address add, string memory nul) internal{
        nullToAdd[nul] = add;
        uint256 n = noOfNullHshs[add];
        addToNullHsh[add][n] = nul;
        noOfNullHshs[add] += 1;
    }


    function approve(uint256 _tokenID, address op) public override{
        string memory ownerNull = owners[_tokenID];
        address owner = nullToAdd[ownerNull];

        require(op != owner,"Invalid operator address");
        tokenIDToAdd[_tokenID] = op;
    }


    function getApprovedAdd(uint256 _tokenID) public override view returns(address){
        return tokenIDToAdd[_tokenID];
    }

    function getNumberOfTokens() public view returns(uint256) {
        return tokenID;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }
} 