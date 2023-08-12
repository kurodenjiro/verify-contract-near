
export type ResponseError = {
  message: string
}

export type Contract = {
  block_hash :string,
  block_height:string,
  code_base64:string,
  hash:string,
}

export type Verify = {
  status:boolean
}
