import { NextApiRequest, NextApiResponse } from 'next'
import type { Contract, ResponseError , Verify } from '../../../interfaces'
import { providers } from 'near-api-js';

const fs = require("fs"); // Or `import fs from "fs";` with ESM

export default async function contractHandler(
  req: NextApiRequest,
  res: NextApiResponse<Verify | ResponseError>
) {
  const { query } = req
  const { contractId } = query


// directory to check if exists
const dir = `./contract/${contractId}`
const network = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};


const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

let resProvider : Contract = await provider.query({
 request_type: 'view_code',
 account_id: contractId,
 finality: 'final',
});


// check if directory exists
if (fs.existsSync(dir)) {
  return res.status(200).json(resProvider)
} else {
  return res.status(200).json(resProvider)
}


  // User with id exists
  
}


