import React from 'react';
import { ethers } from 'ethers';

function formatAccount(account) {
    const start = account.substring(0, 6);
    const end = account.substring(account.length - 4);
    return `${start}...${end}`;
}

class WalletSelector extends React.Component {
    componentDidMount = async () => {
        await this.connectWallet();
    }

    // TODO: use provider.on('network') to handle network change
    updateNetwork = () => {
        let newStatus = false;
        try {
            const current = window.ethereum.networkVersion;
            newStatus = this.props.networks.includes(current) || current.parseInt() > 1000;
        } catch (error) {
        }
        this.props.setNetworkStatus(newStatus)
    }

    connectWallet = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length !== 0) {
            this.props.setAccount(accounts[0]);
        }
    }

    renderWidget = (msg, classes) => {
        const additionalClasses = typeof (classes) === "string" ? classes : classes.join(' ');
        return <span className={`badge rounded-pill p-3 fs-6 ${additionalClasses}`}>{msg}</span>
    }

    renderWarning = (msg) => {
        return this.renderWidget(msg, ['text-dark ', 'bg-warning']);
    }

    renderConnected = () => {
        return this.renderWidget(formatAccount(this.props.account), this.props.isAdmin ? 'bg-secondary' : 'bg-primary');
    }

    renderDisconnected = () => {
        return <button className="btn btn-primary" onClick={this.connectWallet}>Connect to Wallet</button>;
    }

    render = () => {
        if (!window.ethereum) {
            return this.renderWarning("Please install Metamask");
        }
        if (!this.props.networkStatus) {
            return this.renderWarning("Wrong network");
        }
        return this.props.account ? this.renderConnected() : this.renderDisconnected();
    }
}

export default WalletSelector;