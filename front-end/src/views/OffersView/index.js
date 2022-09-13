import React from "react";
import OfferTable from "../../components/OfferTable";

function OffersView(props) {
    return <OfferTable offers={props.offers} actionName="Buy" onAction={props.buyOffer} showMine />
}

export default OffersView;