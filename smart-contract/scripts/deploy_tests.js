require('dotenv').config()

const path = require('path');
const fs = require('fs');
const ethernal = require('hardhat-ethernal');

/** ==========================================================================
 * 
 * This script is used to deploy smart contracts with some fake data to ease
 * front-end testing.
 *
 ========================================================================== */

const ETHERNAL_WORKSPACE_NAME = "Black Market";

const FRONT_END_CONTRACT_FILE = path.resolve(__dirname, '../../front-end/src/contracts/addresses.js');
const CONTRACT_ABI_FILE = path.resolve(__dirname, '../artifacts/contracts/Exchange.sol/Exchange.json');
const FRONT_END_CONTRACT_ABI_FILE = path.resolve(__dirname, '../../front-end/src/contracts/abi/Exchange.json');

const updateFrontEndContractAddress = (contractAddress) => {
    const contractFileContent = `
const CONTRACT_ADDRESS = '${contractAddress}';
export { CONTRACT_ADDRESS };
`
    try {
        fs.writeFileSync(FRONT_END_CONTRACT_FILE, contractFileContent);
        console.log(`front-end contract address: ${contractAddress} updated!`);
    }
    catch (err) {
        console.error("Unable to update front-end file with the new contract address ...");
        console.error(err);
    }
}

const updateFrontEndContractAbiFile = () => {
    try {
        const abiFile = fs.readFileSync(CONTRACT_ABI_FILE);
        const abiFileContent = JSON.parse(abiFile);

        fs.writeFileSync(FRONT_END_CONTRACT_ABI_FILE, JSON.stringify(abiFileContent.abi, null, 2));
        console.log(`front-end contract ABI file updated!`);
    }
    catch (err) {
        console.error("Unable to update front-end contract ABI ile with the new content ...");
        console.error(err);
    }
}

/**
 * Update the front-end with the new contract address and the new ABI file.
 */
const updateFrontEnd = (contractAddress) => {
    updateFrontEndContractAddress(contractAddress);
    updateFrontEndContractAbiFile();
}

/**
 * Get the string representation of a token
 */
const stringifyToken = async (token) => {
    const name = await token.name();
    const symbol = await token.symbol();

    return `${name} ${symbol} ${token.address}`
}

/**
 * 
 */
const toBN = (value, decimals) => (value * 10 ** decimals).toLocaleString('fullwide', { useGrouping: false });

/**
 * Deploy several tokens locally to be able to test the exchange.
 */
const deployTokens = async () => {
    tokenNames = ['Token1', 'Token2', 'Token3', 'Token4', 'Token5'];
    tokens = [];

    // deploy token contracts
    for (const tokenName of tokenNames) {
        const factory = await hre.ethers.getContractFactory(tokenName);
        const contract = await factory.deploy();
        tokens.push(contract);
    }
    await Promise.all(tokens.map(async t => await t.deployed()));

     await Promise.all(tokens.map(
        async token => await hre.ethernal.push({ name: await token.name(), address: token.address })
    ));

    for (token of tokens) {
        const desc = await stringifyToken(token);
        console.log("   ", desc);
    }

    // airdrop tokens to users to be able to test the exchange
    const accounts = await hre.ethers.getSigners();
    const amount = 1000;
    for (const token of tokens) {
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        console.log(`tranferring ${amount} ${symbol} to all acounts (decimals: ${decimals})`);
        for (const account of accounts) {
            await token.transfer(account.address, toBN(amount, decimals));
        }
    }

    return tokens;
}

/**
 * Main.
 */
const main = async () => {

    await hre.ethernal.resetWorkspace(ETHERNAL_WORKSPACE_NAME);

    //---------------------------------------------------
    // DEPLOYING CONTRACTS ...
    //---------------------------------------------------

    const accounts = await hre.ethers.getSigners();

    // deploy all the fake tokens locally to be able to test the exchange
    const tokens = await deployTokens();

    // deploy the exchange with some whitelisted tokens
    const whitelistedTokens = [
        tokens[0],
        tokens[1],
    ];

    const factory = await hre.ethers.getContractFactory('Exchange');
    const contract = await factory.deploy(whitelistedTokens.map(t => t.address));
    await contract.deployed();

    await hre.ethernal.push({name: 'Exchange', address: contract.address});

    // create some offers
    const defaultOffers = [
        {
            seller: accounts[0],
            fromToken: whitelistedTokens[0],
            fromTokenAmount: 100,
            toToken: whitelistedTokens[1],
            toTokenAmount: 400
        },
        {
            seller: accounts[1],
            fromToken: whitelistedTokens[0],
            fromTokenAmount: 200,
            toToken: whitelistedTokens[1],
            toTokenAmount: 300
        },
        {
            seller: accounts[2],
            fromToken: whitelistedTokens[1],
            fromTokenAmount: 300,
            toToken: whitelistedTokens[0],
            toTokenAmount: 200
        },
        {
            seller: accounts[3],
            fromToken: whitelistedTokens[1],
            fromTokenAmount: 400,
            toToken: whitelistedTokens[0],
            toTokenAmount: 100
        },
    ];
    for (offer of defaultOffers) {
        const fromDecimals = await offer.fromToken.decimals();
        const toDecimals = await offer.toToken.decimals();

        await offer.fromToken.connect(offer.seller).increaseAllowance(contract.address, toBN(offer.fromTokenAmount, fromDecimals));
        await contract.connect(offer.seller).createOffer(
            offer.fromToken.address,
            toBN(offer.fromTokenAmount, fromDecimals),
            offer.toToken.address,
            toBN(offer.toTokenAmount, toDecimals)
        );
    }

    // update the front-end
    updateFrontEnd(contract.address);

    //---------------------------------------------------
    // SHOWING SOME INFO ...
    //---------------------------------------------------

    // show data
    const owner = await contract.owner();

    console.log("");
    console.log("Contract deployed to:", contract.address);
    console.log("Contract owner: ", owner);
    console.log("");

    whTokens = await contract.getWhitelistedTokens();

    console.log("Whitelisted tokens: ", whTokens);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();
