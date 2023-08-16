///home/kurodenjiro/verify-contract-near/contract/dev-1691657228398-16741741882932/
const decompress = require("decompress");
const fs = require('fs')
const fsExtra = require('fs-extra');

const {
	exec
} = require("child_process");
const {
	providers
} = require('near-api-js');
const toml = require('toml');

var args = process.argv.slice(2);

const contractId = args[0]

let rustup = 'rustup target add wasm32-unknown-unknown';
let cargo = 'cargo build --all --target wasm32-unknown-unknown --release';
let abi = 'cargo near abi';

const network = {
	networkId: "testnet",
	nodeUrl: "https://rpc.testnet.near.org",
	walletUrl: "https://wallet.testnet.near.org",
	helperUrl: "https://helper.testnet.near.org",
	explorerUrl: "https://explorer.testnet.near.org",
};

const provider = new providers.JsonRpcProvider({
	url: network.nodeUrl
});

const pathSource = `../../../contract/${contractId}/source-contract.zip`

if (fs.existsSync(pathSource)) {
	decompress(pathSource, `../../../contract/${contractId}/`)
		.then((files) => {
			fs.writeFileSync(`../../../contract/${contractId}/verify.json`, JSON.stringify({status:'checking'}));
			if (fs.existsSync(`../../../contract/${contractId}/Cargo.toml`)) {
				const config = toml.parse(fs.readFileSync(`../../../contract/${contractId}/Cargo.toml`, 'utf-8'));
				const package = config.package;
				exec(` ${rustup} && ${cargo} && ${abi}`, {
					cwd: `../../../contract/${contractId}/`
				}, function(error, stdout, stderr) {
					if (error) {
						console.log(`error: ${error.message}`);
						return;
					}
					if (stderr) {
						console.log(`stderr: ${stderr}`);
	
						if (fs.existsSync(`../../../contract/${contractId}/target/wasm32-unknown-unknown/release/${package.name}.wasm`)) {
							provider.query({
								request_type: 'view_code',
								account_id: contractId,
								finality: 'final',
							}).then(function(response) {
	
								const contractCodeView = response.code_base64;
	
								const contract = fs.readFileSync(`../../../contract/${contractId}/target/wasm32-unknown-unknown/release/${package.name}.wasm`, 'latin1')
								fs.readFile(`../../../contract/${contractId}/target/wasm32-unknown-unknown/release/${package.name}.wasm`, 'latin1', (err, data) => {
									if (contract == atob(contractCodeView)) {
										fs.writeFileSync(`../../../contract/${contractId}/verify.json`,JSON.stringify({status:'true'}) );
									} else {
										fsExtra.emptyDirSync(`../../../contract/${contractId}/`);
										fs.writeFileSync(`../../../contract/${contractId}/verify.json`, JSON.stringify({status:'false'}) );
									}
	
								});
	
							});
						}
	
						return;
					}
	
					console.log(`Output: ${stdout}`);
				});
			}else{
				fsExtra.emptyDirSync(`../../../contract/${contractId}/`);
				
				fs.writeFileSync(`../../../contract/${contractId}/verify.json`,JSON.stringify({status:'false'}));
			}

		})
		.catch((error) => {
			console.log(error);
		});
} else {
	fsExtra.emptyDirSync(`../../../contract/${contractId}/`);
	fs.writeFileSync(`../../../contract/${contractId}/verify.json`, JSON.stringify({status:'false'}));

}
try {

} catch (err) {
	console.error(err)
}