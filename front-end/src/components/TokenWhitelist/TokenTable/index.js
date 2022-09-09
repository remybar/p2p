import React from 'react';
import TokenRow from '../TokenRow';

class TokenTable extends React.Component {
  render() {
    return (
      <table className="table table-striped">
        <thead className="text-light">
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Symbol</th>
            <th scope="col">Address</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {[].concat(this.props.tokens)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(
            (t) => <TokenRow
              key={t.addr}
              addr={t.addr}
              name={t.name}
              symbol={t.symbol}
              unwhitelist={this.props.unwhitelist}
            />
          )}
        </tbody>
      </table>
    );
  }
}

export default TokenTable;