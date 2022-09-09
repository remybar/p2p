import React from 'react';

class TokenRow extends React.Component {
    render() {
        return (
            <tr>
                <td className="text-light">{this.props.name}</td>
                <td className="text-light">{this.props.symbol}</td>
                <td className="text-light">{this.props.addr}</td>
                <td className="text-light">
                    <button
                        className="btn btn-primary"
                        onClick={(e) => { this.props.unwhitelist(this.props.addr); }}>unwhitelist
                    </button>
                </td>
            </tr>
        );
    }
}

export default TokenRow;