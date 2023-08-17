import { NextApiResponse, NextApiRequest } from 'next'
import type { Contract, ResponseError , Verify } from '../../../interfaces'
import fs from 'fs'
import path from 'path'
import toml from 'toml';

let codeSource = [];

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Verify | ResponseError>
) {
	let abi = null;
	
	const contractId = _req.query.contractId;
	const pathSource = `./contract/${contractId}/verify.json`
	const cargoSource = `./contract/${contractId}/Cargo.toml`
	const packageSource = `./contract/${contractId}/package.json`
	if (fs.existsSync(cargoSource)) {
		const config = toml.parse(fs.readFileSync(cargoSource, 'utf-8'));
		if (fs.existsSync(`./contract/${contractId}/target/near/${config.package.name}_abi.json`)) {
			abi =JSON.parse( fs.readFileSync(`./contract/${contractId}/target/near/${config.package.name}_abi.json`, 'utf-8'));
		}

	}
	if (fs.existsSync(packageSource)) {
			//get abi tyescript
			if (fs.existsSync(`./contract/${contractId}/build/contract-abi.json`)) {
				abi =JSON.parse( fs.readFileSync(`./contract/${contractId}/build/contract-abi.json`, 'utf-8'));
			}
	}

	if (fs.existsSync(pathSource)) {
		traverseDir(`./contract/${contractId}/src`);
		const sourceView = []
		codeSource.forEach(item =>{
			sourceView.push({path:item.replace(`contract/${contractId}/`,""),code:JSON.stringify(fs.readFileSync(item, 'utf-8'))})
		})

		const verify = JSON.parse(fs.readFileSync(pathSource, 'utf-8'));
		return res.status(200).json({status:verify.status,abi:abi,sourceView:sourceView})
	}else{
		return res.status(200).json({status:false})
	}
  
}
function traverseDir(dir) {
	fs.readdirSync(dir).forEach(file => {
		let fullPath = path.join(dir, file);
		if (fs.lstatSync(fullPath).isDirectory()) {
			 //console.log(fullPath);
			 traverseDir(fullPath);
		 } else {
			 //\console.log(fullPath);
			 codeSource.push(fullPath);
		 }  
	});
}