// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * Library for managing sets of tokens with their associated metadata.
 * - tokens (and their metadata) are added, removed and checked for existence in constant time (O(1)).
 * - tokens are enumerated in O(n). No guarantees are made on the ordering.
 *
 * Inspired from the EnumerableSet of OpenZeppelin.
 */
library Tokens {
    /**
     * Metadata stored for each token.
     */
    struct TokenMetadata {
        address addr;
        string name;
        string symbol;
        uint8 decimals;
    }

    /**
     * A set of tokens with their metadata.
     */
    struct TokenSet {
        // internal storage of tokens' metadata
        TokenMetadata[] _values;
        // Position of a token (identified by its address) in the token set.
        // A position starts from 1 to the length of the `_values` array.
        // In this mapping, a position set to 0 means that the token is not in the set.
        mapping(address => uint256) _positions;
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
     * @dev Add a token address in the token set.
     * Metadata are retrieved thanks to the `IERC20Metadata` interface
     * using the token address.
     *
     * If the token is already in the set, just do nothing.
     */
    function add(TokenSet storage tokens, address addr) internal {
        if (!contains(tokens, addr)) {
            IERC20Metadata metadata = IERC20Metadata(addr);
            tokens._values.push(
                TokenMetadata({
                    addr: addr,
                    name: metadata.name(),
                    symbol: metadata.symbol(),
                    decimals: metadata.decimals()
                })
            );
            tokens._positions[addr] = tokens._values.length;
        }
    }

    /**
     * @dev Remove a token address and its metadata from the token set.
     *
     * Raise an exception if the token address does not exist in the set.
     */
    function remove(TokenSet storage tokens, address addr) internal {
        // We read and store the token's index to prevent multiple reads from the same storage slot
        uint256 pos = tokens._positions[addr];

        require(pos != 0, "The token is not whitelisted yet");

        // To delete a token from the _values array in O(1), we swap the token to delete
        // with the last one in the array, and then remove the last token.
        // Note that this modifies the order of the array.
        uint256 toDeleteIndex = _positionToIndex(pos);
        uint256 lastIndex = _positionToIndex(tokens._values.length);

        if (lastIndex != toDeleteIndex) {
            TokenMetadata memory lastInfo = tokens._values[lastIndex];

            tokens._values[toDeleteIndex] = lastInfo;
            tokens._positions[lastInfo.addr] = _indexToPosition(toDeleteIndex);
        }

        // Delete the slot where the moved token was stored
        tokens._values.pop();

        // Delete the position for the deleted slot
        delete tokens._positions[addr];
    }

    /**
     * @dev Indicates if a token address is present in the token set.
     *
     * @return true if present, false otherwise.
     */
    function contains(TokenSet storage tokens, address addr)
        internal
        view
        returns (bool)
    {
        return tokens._positions[addr] != 0;
    }

    /**
     * @dev Get the full set of tokens and their metadata.
     */
    function getAll(TokenSet storage tokens)
        internal
        view
        returns (TokenMetadata[] memory)
    {
        return tokens._values;
    }
}
