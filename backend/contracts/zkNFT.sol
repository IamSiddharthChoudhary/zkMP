// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

import "./IzkNFT.sol";

contract zkNFT is IZkNFT{

    event NFTTransfered(uint256 indexed from ,uint256 indexed to ,uint256 indexed tokenID);
    event MetadataUpdate(uint256 indexed tokenID);

    mapping(address => mapping (uint256=> uint256)) private addToCom;
    mapping(uint256 => address) private comToAdd;
    mapping(address => uint256) private noOfComs; 
    mapping(uint256 => uint256) private owners;
    mapping(uint256 => string) private tokenURIs;
    mapping (uint256 => address) tokenIDToAdd;

    string _name = "zkMP";
    string _symbol = "Z";
    uint256 private tokenID;
    
    constructor(){
        tokenID = 0;
    }

    function createNFT(uint256 commitment, string memory tokenURI) public {
        address creator = msg.sender;

        setAddAndCom(creator,commitment);
        mintNFT(commitment,tokenURI);
        tokenID++;
    }

    function mintNFT(uint256 commitment,string memory _tokenURI) internal {
        owners[tokenID] = commitment;
        setTokenURI(tokenID,_tokenURI);

        emit NFTTransfered(0, commitment, tokenID);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        tokenURIs[tokenId] = _tokenURI;

        emit MetadataUpdate(tokenId);
    }

    function transferFrom(uint256 ownerCom, uint256 buyerCom, address buyer, uint256 _tokenID) public override{

        require(getApprovedAdd(_tokenID) == msg.sender, "No approved to make this call");
        require(keccak256(abi.encodePacked(ownerOf(_tokenID))) == keccak256(abi.encodePacked(ownerCom)), "Invalid comifier hash");

        transferNFT(_tokenID, buyerCom, buyer);
    }

    function transferNFT(uint256 _tokenID, uint256 commitment, address buyer) public override{
        // owner losing nft
        uint256 crtrCom = owners[_tokenID];
        address owner = comToAdd[crtrCom]; 
        delete owners[_tokenID];
        uint256 n = noOfComs[owner] - 1;
        delete addToCom[owner][n];
        noOfComs[owner] -= 1 ;

        // Buyer getting nft
        setAddAndCom(buyer,commitment);
        owners[_tokenID] = commitment; 
    }   

    function ownerOf(uint256 _tokenID) public override view returns (uint256){
        return owners[_tokenID];
    }

    function exists(uint256 _tokenID) internal view returns (bool) {
       return !(owners[_tokenID] == 0);
    }

    function setAddAndCom(address add, uint256 com) internal{
        comToAdd[com] = add;
        uint256 n = noOfComs[add];
        addToCom[add][n] = com;
        noOfComs[add] += 1;
    }


    function approve(uint256 _tokenID, address op) public override{
        uint256 ownerCom = owners[_tokenID];
        address owner = comToAdd[ownerCom];

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