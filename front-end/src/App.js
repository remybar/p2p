import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Row, Col, ListGroup } from 'react-bootstrap';
import { ethers } from 'ethers';

import './App.css';
import AdminView from './views/AdminView';
import OffersView from './views/OffersView';
import MyOffersView from './views/MyOffersView';

import Navigation from './components/Navigation';
import WalletSelector from './components/WalletSelector';
import Footer from './components/Footer';
import AlertList from './components/AlertList';

import { CONTRACT_ADDRESS } from './contracts/addresses';
import CONTRACT_ABI from './contracts/abi/Exchange.json';

const ALLOWED_NETWORKS = [
  {name: 'Ethereum', chainId: '1'},
  {name: 'Localhost', chainId: '31337'},
  {name: 'Rinkeby', chainId: '4'}
];

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
      isExpectedNetwork: false,
      whitelistedTokens: [],
      whitelistedTokensInfo: [],
      offers: [],
      alerts: [],
    };
  }

  addAlert = (message, kind) => {
    const lastId = this.state.alerts.length > 0 ? this.state.alerts.at(-1).id : 0;
    const alerts = [...this.state.alerts, { id: lastId + 1, message, kind }];
    this.setState({ alerts });
  }

  addSuccessAlert = (message) => this.addAlert(message, 'success');
  addErrorAlert = (message) => this.addAlert(message, 'danger');

  dismissAlert = (id) => {
    const alerts = this.state.alerts.filter(a => a.id !== id);
    this.setState({ alerts });
  }
  
  setAccount = (account) => {
    this.setState({ account: account ? account.toUpperCase() : null });
  }

  setNetworkStatus = (status) => {
    this.setState({ isExpectedNetwork: status });
  }

  isOwner = (owner) => {
    return owner.toUpperCase() === this.state.account;
  }

  getMyOffers = () => {
    if (!this.state.account) return [];
    return this.state.offers.filter(o => o.isMine);
  }

  displayableOffers = (offers) => offers.map(offer => (
    {
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
    }
  ));

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
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      try {
        const tx = await this.state.contract.whitelistToken(addr);
        await provider.waitForTransaction(tx.hash).then(() => {
          this.loadWhitelistedTokens(this.state.contract);
          this.addSuccessAlert(`Token whitelisted!`);
        })
      }
      catch(error) {
        this.addErrorAlert('Unable to whitelist this token address');
      }
    }
  }

  unwhitelistToken = async (addr) => {
    if (this.state.contract) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      try {
        const tx = await this.state.contract.unwhitelistToken(addr);

        await provider.waitForTransaction(tx.hash).then(() => {
          this.loadWhitelistedTokens(this.state.contract);
          this.addSuccessAlert(`Token unwhitelisted!`);
        });
      }
      catch(error) {
        this.addErrorAlert('Unable to unwhitelist this token');
      }
    }
  }

  loadOffers = async () => {
    if (this.state.contract) {
      try {
        const offers = await this.state.contract.getOffers();
        const updatedOffers = this.displayableOffers(offers);
        this.setState({ offers: updatedOffers });
      }
      catch(error) {
        this.addErrorAlert('Unable to load offers');
      }
    }
  }

  createOffer = async (fromTokenAddress, fromTokenAmount, toTokenAddress, toTokenAmount) => {
    if (this.state.contract) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

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

      try {
        const allowanceTx = await erc20.increaseAllowance(this.state.contract.address, fromTokenAmountBS);

        // then, create the offer
        await provider.waitForTransaction(allowanceTx.hash).then(async () => {
          try {
            const offerTx = await this.state.contract.createOffer(
              fromTokenAddress,
              fromTokenAmountBS,
              toTokenAddress,
              toTokenAmountBS
            );
            await provider.waitForTransaction(offerTx.hash).then(() => {
              this.loadOffers();
              this.addSuccessAlert("Offer created!");
            });
          }
          catch (error) {
            this.addErrorAlert("Unable to create a new offer");
          }
        });
      }
      catch (error) {
        this.addErrorAlert("Token transfer not allowed by the owner");
      }
    }
  }

  buyOffer = async (offerId) => {
    if (this.state.contract) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const offer = this.state.offers.find(offer => offer.id === offerId);

      if (offer) {

        try {
          // first the buyer must allow our smart contract to get "toToken" from his wallet
          const erc20 = this.createContract(offer.toToken, ERC20_ABI);
          const allowanceTx = await erc20.increaseAllowance(this.state.contract.address, offer.toTokenAmount);

          // then, buy the offer
          await provider.waitForTransaction(allowanceTx.hash).then(async () => {
            try {
              const offerTx = await this.state.contract.buyOffer(offerId);
              
              await provider.waitForTransaction(offerTx.hash).then(() => {
                this.loadOffers();
                this.addSuccessAlert("Offer bought!");
              });
            }
            catch (error) {
              this.addErrorAlert("Unable to buy this offer");
            }
          });
        }
        catch (error) {
          this.addErrorAlert("Token transfer cancelled");
        }
      }
    }
  }

  removeOffer = async (offerId) => {
    if (this.state.contract) {
      try {
        const tx = await this.state.contract.cancelOffer(offerId);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.waitForTransaction(tx.hash).then(() => {
          this.loadOffers();
          this.addSuccessAlert("Offer removed!");
        });
      }
      catch (error) {
        this.addErrorAlert("Unable to remove this offer");
      }
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
            expectedNetworks={ALLOWED_NETWORKS}
            isExpectedNetwork={this.state.isExpectedNetwork}
            setNetworkStatus={this.setNetworkStatus}
            isAdmin={this.state.isAdmin}
          />
        </Navigation>
        <AlertList alerts={this.state.alerts} dismiss={this.dismissAlert}/>
        {
          this.state.account && this.state.isExpectedNetwork
          ? <Routes>
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
          : <Row className="m-5 text-white text-center">
              <Col>
                  {
                    !this.state.account
                    ? <h1>Please connect to a wallet.</h1>
                    : <>
                        <h1>Please select a correct network</h1>
                        <p>
                          Accepted: { ALLOWED_NETWORKS.map(n => n.name).join(' | ') }
                        </p>
                      </>
                  }
              </Col>
              </Row>
        }
        <Footer />
      </Router>
    );
  }
}

export default App;
