// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * Library for managing sets of offers.
 * - offers are added, removed and checked for existence in constant time (O(1)).
 * - offers are enumerated in O(n). No guarantees are made on the ordering.
 *
 * Inspired from the EnumerableSet of OpenZeppelin.
 */
library Offers {
    using Counters for Counters.Counter;

    /**
     * @dev Offer data.
     */
    struct Offer {
        uint32 id; // starts from 1 to keep 0 as an invalid offer ID.
        address owner;
        address fromToken;
        uint256 fromTokenAmount;
        address toToken;
        uint256 toTokenAmount;
    }

    struct OfferSet {
        // Storage of offers
        Offer[] _values;
        // Id of the next offer
        Counters.Counter _nextId;
        // Position of an offer (identified by its id) in the offer set.
        // A position starts from 1 to the length of the `_values` array.
        // In this mapping, a position set to 0 means that the offer is not in the set.
        mapping(uint32 => uint256) _positions;
    }

    /**
     * @dev Convert a position into an index in the `_values` array.
     *
     * @return the index in the `_values` array.
     */
    function _positionToIndex(uint256 pos) private pure returns (uint256) {
        return pos - 1;
    }

    /**
     * @dev Convert an index in the `_values` array to a position.
     * 
     * @return the position.
     */
    function _indexToPosition(uint256 index) private pure returns (uint256) {
        return index + 1;
    }

    /**
     * @dev Add an offer in the offer set.
     * The offer ID is generated and set internally.
     *
     * Returns the new offer ID.
     */
    function add(OfferSet storage offers, Offer memory offer)
        internal
        returns (uint32)
    {
        offers._nextId.increment(); // increment first to keep 0 as an invalid offer ID.
        uint32 newOfferId = uint32(offers._nextId.current());

        offer.id = newOfferId;
        offers._values.push(offer);
        offers._positions[newOfferId] = offers._values.length;

        return newOfferId;
    }

    /**
     * @dev Removes an offer from an offers set.
     * @return true if the offer was removed from the set (so already present in the set).
     *
     * Raise an exception if the offer ID is invalid.
     */
    function remove(OfferSet storage offers, uint32 offerId)
        internal
        returns (bool)
    {
        require(offerId > 0, "Invalid offer ID");

        // We read and store the offer's index to prevent multiple reads from the same storage slot
        uint256 offerPos = offers._positions[offerId];

        if (offerPos != 0) {
            // To delete an offer from the _values array in O(1), we swap the offer to delete
            // with the last one in the array, and then remove the last offer
            // Note that this modifies the order of the array.
            uint256 toDeleteIndex = _positionToIndex(offerPos);
            uint256 lastIndex = _positionToIndex(offers._values.length);

            if (lastIndex != toDeleteIndex) {
                Offer memory lastOffer = offers._values[lastIndex];

                offers._values[toDeleteIndex] = lastOffer;
                offers._positions[lastOffer.id] = _indexToPosition(toDeleteIndex);
            }

            // Delete the slot where the moved offer was stored
            offers._values.pop();

            // Delete the position for the deleted slot
            delete offers._positions[offerId];

            return true;
        }
        return false;
    }

    /**
     * @dev Returns true if the offer ID is in the offers set.
     *
     * Raise an exception if the offer ID is invalid.
     */
    function contains(OfferSet storage offers, uint32 offerId)
        internal
        view
        returns (bool)
    {
        require(offerId > 0, "Invalid offer ID");
        return offers._positions[offerId] != 0;
    }

    /**
     * @dev Get an offer from its id.
     *
     * Raise an exception if:
     * - the offer ID is invalid,
     * - the offer ID is not present in the offer set.
     */
    function get(OfferSet storage offers, uint32 offerId)
        internal
        view
        returns (Offer memory)
    {
        require(offerId > 0, "Invalid offer ID");

        uint256 offerPos = offers._positions[offerId];
        require(offerPos > 0, "Unexisting offer ID");

        return offers._values[_positionToIndex(offerPos)];
    }

    /**
     * @dev Return the entire offers set in an array
     */
    function getAll(OfferSet storage offers)
        internal
        view
        returns (Offer[] memory)
    {
        return offers._values;
    }
}
