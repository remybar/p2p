// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "../libraries/Offers.sol";

contract OffersMock {
    using Offers for Offers.OfferSet;

    Offers.OfferSet private _offers;

    function add(Offers.Offer memory offer)
        public
        returns (uint32)
    {
        return Offers.add(_offers, offer);
    }

    function remove(uint32 offerId)
        public
        returns (bool)
    {
        return Offers.remove(_offers, offerId);
    }

    function contains(uint32 offerId)
        public
        view
        returns (bool)
    {
        return Offers.contains(_offers, offerId);
    }

    function get(uint32 offerId)
        public
        view
        returns (Offers.Offer memory)
    {
        return Offers.get(_offers, offerId);
    }

    function getAll()
        public
        view
        returns (Offers.Offer[] memory)
    {
        return Offers.getAll(_offers);
    }
}
