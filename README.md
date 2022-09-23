# Peer to peer decentralized exchange

MA BRANCHE

![ci](https://github.com/remybar/p2p/actions/workflows/ci.yml/badge.svg)

[Code coverage](https://app.codecov.io/gh/remybar/p2p)

## Description

This is a personal project to learn Solidity development.
This is basically a decentralized peer to peer exchange. 

For example, Alice has a lot of tokens A but wants to buy some tokens B.
She will create an offer saying "I sell 10 tokens A against 15 tokens B".
John looks at the offer list and he's interested to buy some tokens A.
So, he buy Alice's offer by giving 15 tokens B and receiving 10 tokens.
At the same time, Alice's wallet is credited of 15 tokens B.

Note that in the next version, a fee will be applied when an offer is sold.

## web3 stack

For this project, I use the following web3 stack:
* client framework: `react`
* Ethereum development environment: `hardhat`
* Ethereum Web client library:  `ether.js`
* Test framework: `mocha`
* Assertion library: `chai`
* Local blockchain explorer: `ethernal` 

## how to build / deploy ?

### smart contract

Go to the `smart-contract` folder and:
* `npm install` to set-up the project.
* `npx hardhat compile` to compile the smart contracts.
* `npx hardhat test` to launch unit tests.
* `npx hardhat node` to start a local hardhat node, be able to deploy smart contracts on it and access it 
  through a wallet (like Metamask) to test the dApp. 
  Then, to be able to use it, configure the wallet with the network http://127.0.0.1:8545, chain ID 31337
* `npx hardhat run scripts/deploy_tests.js --network localhost` to deploy smart contracts and fake data to the
  local hardhat node and be able to test the front-end.

### front-end

Go to the `front-end` folder and:
* `npm install` to set-up the project.
* `npm start` to start a local server on http://localhost:3000

# FAQ
 
## Ethernal

* Unable to find json artifact files while deploying/pushing some smart contracts to Ethernal ?

Use `npx hardhat clean` to clean everything (i.e remove artifacts) and then recompile your contracts (`npx hardhat compile`)
