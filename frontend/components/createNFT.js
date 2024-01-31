import { useRef, useState } from "react";
import { ethers, getIcapAddress } from "ethers";
import crypto from "crypto";
import $u from "../utils/$u";
import axios from "axios";
import { groth16 } from "snarkjs";
const wc = require("../circuit/witness_calculator.js");

const zkNFT = process.env.NEXT_PUBLIC_zkNFT;
const zkContract = process.env.NEXT_PUBLIC_ZkContract;

const zkContractJSON = require("../json/ZkContract.json");
const zkCABI = zkContractJSON.abi;
const zkCInterface = new ethers.Interface(zkCABI);

const zkNftJSON = require("../json/zkNFT.json");
const zkNftAbi = zkNftJSON.abi;
const zkNftInterface = new ethers.Interface(zkNftAbi);

const ButtonState = { Normal: 0, Loading: 1, Disabled: 2 };
var activeAccount;

const Create = () => {
  const [account, updateAccount] = useState(null);
  const [fileImg, setFileImg] = useState(null);
  const [textArea, updateTextArea] = useState(null);
  const [metamaskButtonState, updateMetamaskButtonState] = useState(
    ButtonState.Normal
  );
  const [proofElements, updateProofElements] = useState(null);
  const imageInput = useRef(null);

  let tokenURI;
  const connectMetamask = async () => {
    try {
      updateMetamaskButtonState(ButtonState.Disabled);
      if (!window.ethereum) {
        alert("Please install Metamask to use this app.");
        throw "no-metamask";
      }

      let accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      var chainId = window.ethereum.networkVersion;

      if (chainId != "11155111") {
        alert("Please switch to Sepolia Testnet");
        throw "wrong-chain";
      }

      activeAccount = accounts[0];
      var balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [activeAccount, "latest"],
      });
      balance = $u.moveDecimalLeft(ethers.formatEther(balance).toString(), 18);

      var newAccountState = {
        chainId: chainId,
        address: activeAccount,
        balance: balance,
      };
      updateAccount(newAccountState);
    } catch (e) {
      console.log(e);
    }

    updateMetamaskButtonState(ButtonState.Normal);
  };

  const sendFileToIPFS = async (e) => {
    try {
      console.lgo("Hello");
      const fileToUpload = e.target.files[0];
      const formData = new FormData();
      formData.append("file", fileToUpload, { filename: fileToUpload.name });
      const res = await fetch("/api/pinataSDK", {
        method: "POST",
        body: formData,
      });
      const ipfsHash = await res.text();
      console.log(ipfsHash);
    } catch (e) {
      console.log(e);
      alert("Trouble uploading file");
    }
  };

  const createNFT = async () => {
    const secret = uint8ArrayToBinaryArray(crypto.randomBytes(32)).toString();
    const nullifier = uint8ArrayToBinaryArray(
      crypto.randomBytes(32)
    ).toString();

    const input = {
      secret: $u.BN256ToBin(secret).split(","),
      nullifier: $u.BN256ToBin(nullifier).split(","),
    };

    var res = await fetch("/mint.wasm");
    var buffer = await res.arrayBuffer();
    var checkWC = await wc(buffer);

    const r = await checkWC.calculateWitness(input, 0);

    const commitment = r[1];
    const nullifierHash = r[2];

    const tx1 = {
      to: zkContract,
      from: activeAccount,
      data: zkCInterface.encodeFunctionData("minting", [commitment]),
    };

    tokenURI = "4567890"; // Dummy Input

    const tx2 = {
      to: zkNFT,
      from: activeAccount,
      data: zkNftInterface.encodeFunctionData("createNFT", [
        commitment,
        tokenURI,
      ]),
    };
    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx1],
      });

      const proofElements = {
        nullifierHash: `${nullifierHash}`,
        secret: secret,
        nullifier: nullifier,
        commitment: `${commitment}`,
        txHash: txHash,
      };

      const txHash2 = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx2],
      });

      console.log(proofElements);

      updateProofElements(btoa(JSON.stringify(proofElements)));
    } catch (e) {
      console.log(e);
    }

    // Set proof -- zkContract
    //
  };

  const withdraw = async () => {
    if (!textArea || !textArea.value) {
      alert("Please input the proof of deposit string.");
    }
    try {
      const proofString = textArea.value;
      const proofElements = JSON.parse(atob(proofString));
      receipt = await window.ethereum.request({
        method: "eth_getTransactionReceipt",
        params: [proofElements.txHash],
      });
      if (!receipt) {
        throw "empty-receipt";
      }

      const log = receipt.logs[0];
      const data = log.data;
      const topics = log.topics;
      const decodedData = zkCInterface.decodeEventLog("Mint", data, topics);

      const proofInput = {
        root: $u.BNToDecimal(decodedData.root),
        nullifierHash: proofElements.nullifierHash,
        receipt: parseInt(
          ethers.getIcapAddress(abi.encodePacked(activeAccount)),
          16
        ).toString(),
        secret: $u.BN256ToBin(proofElements.secret).split(""),
        nullifier: $u.BN256ToBin(proofElements.nullifier).split(""),
        hashPairings: decodedData.hashPairings.map((n) => $u.BNToDecimal(n)),
        hashDirections: decodedData.pairDirection,
      };
      const { proof, publicSignals } = await groth16.fullProve(
        proofInput,
        "/check.wasm",
        "/setup_final.zkey"
      );
      const callInputs = [
        proof.pi_a.slice(0, 2).map($u.BN256ToHex),
        proof.pi_b
          .slice(0, 2)
          .map((row) => $u.reverseCoordinate(row.map($u.BN256ToHex))),
        proof.pi_c.slice(0, 2).map($u.BN256ToHex),
        publicSignals.slice(0, 2).map($u.BN256ToHex),
      ];
      const callData = zkCInterface.encodeFunctionData("withdraw", callInputs);
      const tx = {
        to: tornadoAddress,
        from: account.address,
        data: callData,
      };
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
      var receipt;
      while (!receipt) {
        receipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        });
        await new Promise((resolve, reject) => {
          setTimeout(resolve, 1000);
        });
      }
      if (!!receipt) {
        updateWithdrawalSuccessful(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <button onClick={connectMetamask}>Connect</button>
      <div>
        !!proofElements(
        <div>
          <p>{proofElements}</p>
        </div>
        ) : <button onClick={createNFT}>Mint</button>
      </div>
      <input
        type="file"
        id="file"
        ref={imageInput}
        onChange={sendFileToIPFS}
        required
      />
      <div>
        <textarea
          ref={(ta) => {
            updateTextArea(ta);
          }}
        ></textarea>
        <button onClick={withdraw}>Withdraw ammount</button>
      </div>
    </div>
  );
};

function uint8ArrayToBinaryArray(uint8Array) {
  if (uint8Array.length !== 32) {
    throw new Error("Input Uint8Array must have a length of 32.");
  }

  const binaryArray = [];

  for (let i = 0; i < uint8Array.length; i++) {
    const byte = uint8Array[i];
    const binaryString = byte.toString(2).padStart(8, "0"); // Convert byte to 8-bit binary string
    const binaryDigits = binaryString.split("").map(Number); // Convert binary string to array of binary digits
    binaryArray.push(...binaryDigits); // Append binary digits to the result array
  }

  return binaryArray;
}

export default Create;
