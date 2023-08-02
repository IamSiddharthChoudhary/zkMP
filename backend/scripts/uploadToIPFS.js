const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecurityKey = process.env.PINATA_SECURITY_KEY;
const pinata = new pinataSDK(pinataApiKey, pinataSecurityKey);

async function storeImages(image) {
  const fullImagePath = path.resolve(image);
  const file = fs
    .readdirSync(fullImagePath)
    .filter((file) => file.includes(".png"));
  const readableStreamForFile = fs.createReadStream(`${fullImagePath}/${file}`);
  console.log("Uploading to IPFS...");

  try {
    await pinata
      .pinFileToIPFS(readableStreamForFile, options)
      .then((result) => {
        responses.push(result);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }

  return {};
}

async function storeTokenUriMetadata(metadata) {
  const options = {
    pinataMetadata: {
      name: metadata.name,
    },
  };
  try {
    const response = await pinata.pinJSONToIPFS(metadata, options);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}

module.exports = { storeImages, storeTokenUriMetadata };
