import { NextApiResponse, NextApiRequest } from 'next'
import type { Contract, ResponseError , Verify } from '../../../interfaces'
import fs from 'fs'

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Verify | ResponseError>
) {

	const pathSource = `./contract/${_req.query.contracId}/verify.json`
	console.log(_req.query.contracId);
	if (fs.existsSync(pathSource)) {
		const status = JSON.parse(fs.readFileSync(pathSource, 'utf-8'));
		return res.status(200).json(status)
	}else{
		return res.status(200).json({status:false})
	}

  
}