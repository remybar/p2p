//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./libraries/Offers.sol";
import "./libraries/Tokens.sol";

/**
 * @dev Contract for managing peer-to-peer token sells.
 * An user can create an offer to sell an amount of token A against an amount of tokens B.
 * For that, tokens A and B have to be whitelisted first by the contract owner.
 * Another user can accept this offer and provide the required amount of tokens B against
 * the amount of token A.
 * Both buyer and seller have to pay a small fee. 
 */
contract Exchange is Ownable {
    using Offers for Offers.OfferSet;
    using Offers for Offers.Offer;
    using Tokens for Tokens.TokenSet;
    using Tokens for Tokens.TokenMetadata;

    Offers.OfferSet _offers;
    Tokens.TokenSet _whitelistedTokens;

    event LogDepositReceived(address addr);    

    event TokenWhitelisted(address addr);
    event TokenUnwhitelisted(address addr);

    event OfferCreated(uint32 _offerId);
    event OfferRemoved(uint32 _offerId);
    event OfferBought(uint32 _offerId);

    constructor(address[] memory tokenAddresses) {
        for(uint i = 0; i < tokenAddresses.length; i += 1) {
            whitelistToken(tokenAddresses[i]);
        }
    }

    /**
     * TODO: something to implement here ?
     */
    fallback() external payable {
    }

    /**
     * TODO: something to implement here ?
     */
    receive() external payable {
        emit LogDepositReceived(msg.sender);
    }

    /**
     * @dev add a token to the whitelist.
     */
    function whitelistToken(address tokenAddress) public onlyOwner() {
        _whitelistedTokens.add(tokenAddress);
    }

    /**
     * @dev remove a token from the whitelist.
     */
    function unwhitelistToken(address tokenAddress) public onlyOwner() {
        _whitelistedTokens.remove(tokenAddress);
    }

    /**
     * @dev indicates if a token is whitelisted.
     */
    function isTokenWhitelisted(address tokenAddress) public view returns(bool) {
        return _whitelistedTokens.contains(tokenAddress);
    }

    /**
     * @dev get the list of whitelisted tokens.
     */
    function getWhitelistedTokens() public view returns(Tokens.TokenMetadata[] memory) {
        return _whitelistedTokens.getAll();
    }

    /**
     * @dev Get the list of available offers.
     */
    function getOffers() public view returns (Offers.Offer[] memory) {
        return _offers.getAll();
    }

    /**
     * @dev Get an offer from its id.
     */
    function getOffer(uint32 id) public view returns(Offers.Offer memory) {
        require(_offers.contains(id), "The requested offer ID does not exist in the offer set");
        return _offers.get(id);
    }

    /**
     * @dev create a new offer.
     */
    function createOffer(
        address fromTokenAddress,
        uint256  fromTokenAmount,
        address toTokenAddress,
        uint256  toTokenAmount
    ) public {
        require(fromTokenAddress != toTokenAddress, "Same tokens");
        require(isTokenWhitelisted(fromTokenAddress), "fromToken is not whitelisted");
        require(isTokenWhitelisted(toTokenAddress), "toToken is not whitelisted");

        IERC20 token = IERC20(fromTokenAddress);
        require(token.balanceOf(msg.sender) >= fromTokenAmount, "Not enough tokens to sell");
        require(token.transferFrom(msg.sender, address(this), fromTokenAmount));
        
        uint32 id = _offers.add(Offers.Offer({
            id: 0,  // will be set internally by the library and return by the `add` function.
            owner: msg.sender,
            fromToken: fromTokenAddress,
            fromTokenAmount: fromTokenAmount,
            toToken: toTokenAddress,
            toTokenAmount: toTokenAmount
        }));
        emit OfferCreated(id);
    }

    /**
     * @dev Cancel an offer with its id.
     */
    function cancelOffer(uint32 id) public {
        Offers.Offer memory offer = _offers.get(id);
        require(offer.owner == msg.sender, "Not the offer owner");

        IERC20 token = IERC20(offer.fromToken);
        token.transfer(offer.owner, offer.fromTokenAmount);

        _offers.remove(id);
        emit OfferRemoved(id);
    }

    /**
     * Buy an offer.
     */
    function buyOffer(uint32 id) public {
        Offers.Offer memory offer = _offers.get(id);
        require(offer.owner != msg.sender, "Owner cannot buy his own offer");
        
        IERC20 toToken = IERC20(offer.toToken);
        IERC20 fromToken = IERC20(offer.fromToken);
        require(toToken.balanceOf(msg.sender) >= offer.toTokenAmount, "Not enough tokens to buy");
        require(toToken.transferFrom(msg.sender, offer.owner, offer.toTokenAmount));
        require(fromToken.transfer(msg.sender, offer.fromTokenAmount));

        _offers.remove(id);
        emit OfferBought(id);
        emit OfferRemoved(id);
    }
}
