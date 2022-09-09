import React from "react";

import OfferTable from "../../components/OfferTable";
import OfferTableBar from "../../components/OfferTableBar";

function MyOffersView(props) {
  return (
    <>
      <OfferTableBar tokens={props.tokens} createOffer={props.createOffer} />
      <OfferTable offers={props.offers} actionName="Remove" onAction={props.removeOffer} />
    </>
  );
}

export default MyOffersView;