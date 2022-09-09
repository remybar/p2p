import React from "react";
import TokenBar from '../TokenBar';
import TokenTable from '../TokenTable';

function TokenPanel(props) {
  return (
    <div className="container">
      <TokenBar whitelist={props.whitelist} />
      <TokenTable tokens={props.tokens} unwhitelist={props.unwhitelist} />
    </div>
  );
}

export default TokenPanel;