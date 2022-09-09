import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ethers } from 'ethers';

import './App.css';
import AdminView from './views/AdminView';
import OffersView from './views/OffersView';
import MyOffersView from './views/MyOffersView';

import Navigation from './components/Navigation';
import WalletSelector from './components/WalletSelector';
import Footer from './components/Footer';

import { CONTRACT_ADDRESS } from './contracts/addresses';
import CONTRACT_ABI from './contracts/abi/Exchange.json';

const ALLOWED_NETWORKS = ['31337'];

// part of standard ERC-20 ABI to interact with ERC-20 token smart contracts
// to be able to increase allowance and be able to transfer token to our
// smart contract.
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function increaseAllowance(address spender, uint256 addedValue) public returns (bool)",
];

const toDisplayedAmount = (amount, decimals) => ethers.utils.formatUnits(amount, decimals).replace(/\.?0+$/,"");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      contract: null,
      isAdmin: false,
      networkStatus: true,
      whitelistedTokens: [],
      whitelistedTokensInfo: [],
      offers: [],
    };
  }

  setAccount = (account) => {
    this.setState({ account: account ? account.toUpperCase() : null });
  }

  setNetworkStatus = (status) => {
    this.setState({ networkStatus: status });
  }

  isOwner = (owner) => {
    return owner.toUpperCase() === this.state.account;
  }

  getMyOffers = () => {
    if (!this.state.account) return [];
    return this.state.offers.filter(o => o.isMine);
  }

  // initialize application data (mainly coming from our smart contract)
  initializeData = async () => {
    const contract = this.createContract(CONTRACT_ADDRESS, CONTRACT_ABI);
    const owner = await contract.owner();

    this.setState({
      isAdmin: this.isOwner(owner),
      contract: contract
    });

    await this.loadWhitelistedTokens(contract);
    await this.loadOffers(contract);
  }

  // create a Contract object from a contract address and ABI.
  createContract = (contractAddress, contractABI) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(contractAddress, contractABI, provider.getSigner());
  }

  // get the list of whitelisted tokens.
  loadWhitelistedTokens = async () => {
    if (this.state.contract) {
      const tokens = await this.state.contract.getWhitelistedTokens();
      const tokensInfo = new Map(tokens.map(token => [token.addr, token]));

      this.setState({ 
        whitelistedTokens: tokens,
        whitelistedTokensInfo: tokensInfo
       });
    }
  }

  whitelistToken = async (addr) => {
    if (this.state.contract) {
      const tx = await this.state.contract.whitelistToken(addr);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.waitForTransaction(tx.hash).then(() => {
        this.loadWhitelistedTokens(this.state.contract);
      });
    }
  }

  unwhitelistToken = async (addr) => {
    if (this.state.contract) {
      const tx = await this.state.contract.unwhitelistToken(addr);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.waitForTransaction(tx.hash).then(() => {
        this.loadWhitelistedTokens(this.state.contract);
      });
    }
  }

  loadOffers = async () => {
    if (this.state.contract) {
      const offers = await this.state.contract.getOffers();

      const updatedOffers = offers.map(offer => {
        return {
          ...offer,
          fromTokenName: this.state.whitelistedTokensInfo.get(offer.fromToken).symbol,
          fromTokenDisplayedAmount: toDisplayedAmount(
            offer.fromTokenAmount,
            this.state.whitelistedTokensInfo.get(offer.fromToken).decimals
          ), 
          toTokenName: this.state.whitelistedTokensInfo.get(offer.toToken).symbol,
          toTokenDisplayedAmount: toDisplayedAmount(
            offer.toTokenAmount,
            this.state.whitelistedTokensInfo.get(offer.toToken).decimals
          ),
          isMine: this.isOwner(offer.owner)
        };
      });

      this.setState({ offers: updatedOffers });
    }
  }

  createOffer = async (fromTokenAddress, fromTokenAmount, toTokenAddress, toTokenAmount) => {
    if (this.state.contract) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      console.log(this.state);

      const fromTokenAmountBS = ethers.utils.parseUnits(
        fromTokenAmount,
        this.state.whitelistedTokensInfo.get(fromTokenAddress).decimals
        );
      const toTokenAmountBS = ethers.utils.parseUnits(
        toTokenAmount,
        this.state.whitelistedTokensInfo.get(toTokenAddress).decimals
        );
      
      // first, the seller must allow our smart contract to get "fromToken" from his wallet
      const erc20 = this.createContract(fromTokenAddress, ERC20_ABI);
      const allowanceTx = await erc20.increaseAllowance(this.state.contract.address, fromTokenAmountBS);

      // then, create the offer
      await provider.waitForTransaction(allowanceTx.hash).then(async () => {
        const offerTx = await this.state.contract.createOffer(
          fromTokenAddress,
          fromTokenAmountBS,
          toTokenAddress,
          toTokenAmountBS
        );
        await provider.waitForTransaction(offerTx.hash).then(() => {
          this.loadOffers();
        });
      });
    }
  }

  buyOffer = async (offerId) => {
    if (this.state.contract) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const offer = this.state.offers.find(offer => offer.id === offerId);

      console.log("offerId: ", offerId);
      console.log("found offer:", offer);

      if (offer) {
        // first the buyer must allow our smart contract to get "toToken" from his wallet
        const erc20 = this.createContract(offer.toToken, ERC20_ABI);
        const allowanceTx = await erc20.increaseAllowance(this.state.contract.address, offer.toTokenAmount);

        // then, buy the offer
        await provider.waitForTransaction(allowanceTx.hash).then(async () => {
          const offerTx = await this.state.contract.buyOffer(offerId);
          
          await provider.waitForTransaction(offerTx.hash).then(() => {
            this.loadOffers();
          });
        });
      }
    }
  }

  removeOffer = async (offerId) => {
    if (this.state.contract) {
      const tx = await this.state.contract.cancelOffer(offerId);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.waitForTransaction(tx.hash).then(() => {
        this.loadOffers();
      });
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.account !== this.state.account) {
      if (this.state.account) {
        await this.initializeData();
      }
      else {
        this.setState({ isAdmin: false });
      }
    }
  }

  render() {
    return (
      <Router>
        <Navigation isAdmin={this.state.isAdmin}>
          <WalletSelector
            account={this.state.account}
            setAccount={this.setAccount}
            networks={ALLOWED_NETWORKS}
            networkStatus={this.state.networkStatus}
            setNetworkStatus={this.setNetworkStatus}
            isAdmin={this.state.isAdmin}
          />
        </Navigation>
        {this.state.account &&
          <Routes>
            <Route
              path="/"
              element={
                <OffersView
                  offers={this.state.offers}
                  buyOffer={this.buyOffer}
                />
              }
            />
            <Route
              path="/my-offers"
              element={
                <MyOffersView
                  offers={this.getMyOffers()}
                  tokens={this.state.whitelistedTokens}
                  createOffer={this.createOffer}
                  removeOffer={this.removeOffer}
                />
              }
            />
            <Route
              path="/admin"
              element={
                <AdminView
                  isAdmin={this.state.isAdmin}
                  tokens={this.state.whitelistedTokens}
                  whitelist={this.whitelistToken}
                  unwhitelist={this.unwhitelistToken}
                />
              }
            />
          </Routes>
        }
        <Footer />
      </Router>
    );
  }
}

export default App;
