import { NextApiResponse, NextApiRequest } from 'next'
import type { Contract, ResponseError , Verify } from '../../../interfaces'
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Verify | ResponseError>
) {
  return res.status(200).json({status:true})
}
