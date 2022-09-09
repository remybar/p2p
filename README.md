# Peer to peer exchange

## web3 stack

For this project, I use the following web3 stack:
* client framework: `react`
* Ethereum development environment: `hardhat`
* Ethereum Web client library:  `ether.js`
* Test framework: `mocha`
* Assertion library: `chai`
* `ethernal`


## how to build / deploy ?

### smart contract
* `npm install` to set-up the project.
* `npx hardhat compile` to compile the smart contracts.
* `npx hardhat test` to launch unit tests.
* `npx hardhat node` to start a local hardhat node, be able to deploy smart contracts on it and access it 
  through a wallet (like Metamask) to test the dApp. 
  Then, to be able to use it, configure the wallet with the network http://127.0.0.1:8545, chain ID 31337
* `npx hardhat run scripts/deploy_tests.js --network localhost` to deploy smart contracts and fake data to the
  local hardhat node and be able to test the front-end.

### front-end
* `npm install` to set-up the project.
* `npm start` to start a local server on http://localhost:3000


