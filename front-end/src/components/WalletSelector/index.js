import React from 'react';
import { Badge } from 'react-bootstrap';
import { ethers } from 'ethers';

function formatAccount(account) {
    const start = account.substring(2, 6).toUpperCase();
    const end = account.substring(account.length - 4).toUpperCase();
    return `0x${start}...${end}`;
}

class WalletSelector extends React.Component {
    componentDidMount = async () => {
        await this.connectWallet();
    }

    updateAccount = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        provider.provider.on('accountsChanged', accounts => this.props.setAccount(accounts[0]));

        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length !== 0) {
            this.props.setAccount(accounts[0]);
        }
    }

    updateNetworkStatus = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        this.props.setNetworkStatus(
            this.props.expectedNetworks.filter(n => n.chainId.toString() === network.chainId.toString()).length !== 0
        );
    }

    connectWallet = async () => {
        await this.updateAccount();
        await this.updateNetworkStatus();
   }

    renderWidget = (msg, classes) => {
        const additionalClasses = typeof (classes) === "string" ? classes : classes.join(' ');
        return (
            <span className={`badge rounded-pill p-3 fs-6 ${additionalClasses}`}>
                {this.props.isAdmin && <Badge className="mx-2" bg="danger">Admin</Badge>}
                {msg} 
            </span>
        );
    }

    renderError = (msg) => {
        return this.renderWidget(msg, ['text-dark ', 'bg-warning']);
    }

    renderConnected = () => {
        return this.renderWidget(formatAccount(this.props.account), 'bg-primary');
    }

    renderDisconnected = () => {
        return <button className="btn btn-primary" onClick={this.connectWallet}>Connect to a wallet</button>;
    }

    render = () => {
        if (!window.ethereum) {
            return this.renderError("Please install a Web3 wallet");
        }
        if (!this.props.isExpectedNetwork) {
            return this.renderError("Wrong network");
        }
        return this.props.account ? this.renderConnected() : this.renderDisconnected();
    }
}

export default WalletSelector;  