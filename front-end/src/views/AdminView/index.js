import React from "react";
import TokenPanel from "../../components/TokenWhitelist/TokenPanel";

function AdminView(props) {
  const panel = <TokenPanel
    tokens={props.tokens}
    whitelist={props.whitelist}
    unwhitelist={props.unwhitelist}
  />
  return (
    <div className="container p-4">
      {props.isAdmin && panel}
      {!props.isAdmin && <p className="text-light">Please, login as admin to access to the admin dashboard.</p>}
    </div>
  );
}

export default AdminView;
