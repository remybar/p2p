const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BN } = require('@openzeppelin/test-helpers');

function assertOffer(offer, expectedOffer) {
  expect(offer.id).equal(expectedOffer.id);
  expect(offer.owner).equal(expectedOffer.owner);
  expect(offer.fromToken).equal(expectedOffer.fromToken);
  expect(offer.fromTokenAmount).equal(expectedOffer.fromTokenAmount);
  expect(offer.toToken).equal(expectedOffer.toToken);
  expect(offer.toTokenAmount).equal(expectedOffer.toTokenAmount);
}

describe("Exchange", function () {
  const TOKEN1_USER1_STARTING_BALANCE = 10000;
  const TOKEN1_USER2_STARTING_BALANCE = 20000;
  const TOKEN2_USER1_STARTING_BALANCE = 30000;
  const TOKEN2_USER2_STARTING_BALANCE = 40000;
  let token1, token2;
  let Exchange, exchange, owner, user1, user2;

  before(async () => {
    Exchange = await ethers.getContractFactory("Exchange");
    Token1 = await ethers.getContractFactory("Token1");
    Token2 = await ethers.getContractFactory("Token2");
    [owner, user1, user2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    token1 = await Token1.deploy();
    await token1.deployed();

    token2 = await Token2.deploy();
    await token2.deployed();

    exchange = await Exchange.deploy([token1.address, token2.address]);
    await exchange.deployed();

    await token1.transfer(user1.address, TOKEN1_USER1_STARTING_BALANCE);
    await token1.transfer(user2.address, TOKEN1_USER2_STARTING_BALANCE);
    await token2.transfer(user1.address, TOKEN2_USER1_STARTING_BALANCE);
    await token2.transfer(user2.address, TOKEN2_USER2_STARTING_BALANCE);

    await token1.connect(user1).increaseAllowance(exchange.address, TOKEN1_USER1_STARTING_BALANCE);
    await token1.connect(user2).increaseAllowance(exchange.address, TOKEN1_USER2_STARTING_BALANCE);
    await token2.connect(user1).increaseAllowance(exchange.address, TOKEN2_USER1_STARTING_BALANCE);
    await token2.connect(user2).increaseAllowance(exchange.address, TOKEN2_USER2_STARTING_BALANCE);
  });

  describe("Initializing", function () {
    it("Should initialize properly all contract data", async function () {
      const offers = await exchange.getOffers();
      expect(offers).lengthOf(0);
    });

    it("Should correctly set whitelisted tokens", async function () {
      anotherExchange = await Exchange.deploy([token1.address]);
      await anotherExchange.deployed();
      expect(await anotherExchange.isTokenWhitelisted(token1.address)).to.equal(true);
      expect(await anotherExchange.isTokenWhitelisted(token2.address)).to.equal(false);
    });
  });

  describe("Whitelist management", function () {

    it("Should indicate if a token is NOT whitelisted", async function () {
      emptyExchange = await Exchange.deploy([]);
      await emptyExchange.deployed();
      expect(await emptyExchange.isTokenWhitelisted(token1.address)).to.equal(false);
    });

    it("Should indicate if a token is whitelisted", async function () {
      emptyExchange = await Exchange.deploy([]);
      await emptyExchange.deployed();
      await emptyExchange.whitelistToken(token1.address);
      expect(await emptyExchange.isTokenWhitelisted(token1.address)).to.equal(true);
    });

    it("Should indicate if a token has been unwhitelisted", async function () {
      await exchange.unwhitelistToken(token1.address);
      expect(await exchange.isTokenWhitelisted(token1.address)).to.equal(false);
    });
  });

  describe("Creating offers", function () {
    it("Should NOT create an offer if both tokens are the same", async function () {
      await expect(exchange.createOffer(token1.address, 100, token1.address, 50))
        .to.be.revertedWith("Same tokens");
    });

    it("Should NOT create an offer if fromToken is NOT whitelisted", async function () {
      await exchange.unwhitelistToken(token1.address);
      await expect(exchange.createOffer(token1.address, 100, token2.address, 50))
        .to.be.revertedWith("fromToken is not whitelisted");
    });

    it("Should NOT create an offer if toToken is NOT whitelisted", async function () {
      await exchange.unwhitelistToken(token2.address);
      await expect(exchange.createOffer(token1.address, 100, token2.address, 50))
        .to.be.revertedWith("toToken is not whitelisted");
    });

    it("Should NOT create an offer if the vendor does not own enough tokens", async function () {
      await expect(exchange.connect(user1).createOffer(token1.address, TOKEN1_USER1_STARTING_BALANCE + 1, token2.address, 50))
        .to.be.revertedWith("Not enough tokens to sell");
    });

    it("Should NOT create an offer if the vendor has not allowed to move the required amount of tokens", async function () {
      const allowance = await token1.connect(user1).allowance(user1.address, exchange.address);
      await token1.connect(user1).decreaseAllowance(exchange.address, 1);

      await expect(exchange.connect(user1).createOffer(token1.address, allowance, token2.address, 50))
        .to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should create an offer", async function () {
      const balance = await token1.balanceOf(user1.address);
      const depositAmount = 100;
      const expectedAmount = 50;

      await expect(exchange.connect(user1).createOffer(token1.address, depositAmount, token2.address, expectedAmount))
        .to.emit(exchange, 'OfferCreated')
        .withArgs(1);

      const offers = await exchange.getOffers();

      expect(await token1.balanceOf(user1.address)).equals(balance - depositAmount);
      assertOffer(offers[0], {
        id: 1,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: depositAmount,
        toToken: token2.address,
        toTokenAmount: expectedAmount,
      });
    });
  });

  describe("Cancelling offers", function () {

    it("Should raise an exception if the offer id is 0", async function () {
      await expect(exchange.cancelOffer(0)).to.be.revertedWith("Invalid offer ID");
    });

    it("Should raise an exception if the offer does not exist", async function () {
      await expect(exchange.cancelOffer(12)).to.be.revertedWith("Unexisting offer ID");
    });

    it("Should raise an exception if not the offer owner", async function () {
      await exchange.connect(user1).createOffer(token1.address, 100, token2.address, 50);
      await expect(exchange.connect(user2).cancelOffer(1)).to.be.revertedWith("Not the offer owner");
    });

    it("Should cancel the offer when there is only one offer in the list", async function () {
      const balance = await token1.balanceOf(user1.address);

      await exchange.connect(user1).createOffer(token1.address, 100, token2.address, 50);

      await expect(exchange.connect(user1).cancelOffer(1))
        .to.emit(exchange, 'OfferRemoved')
        .withArgs(1);

      expect(await token1.balanceOf(user1.address)).equals(balance);
      expect(await exchange.getOffers()).lengthOf(0);
    });

    it("Should cancel the offer when the offer is the first one in the list", async function () {
      const offer1Amount = 10;
      const offer2Amount = 20;
      const offer3Amount = 30;
      const balance = await token1.balanceOf(user1.address);

      await exchange.connect(user1).createOffer(token1.address, offer1Amount, token2.address, 2);
      await exchange.connect(user1).createOffer(token1.address, offer2Amount, token2.address, 4);
      await exchange.connect(user1).createOffer(token1.address, offer3Amount, token2.address, 6);

      await expect(exchange.connect(user1).cancelOffer(1))
        .to.emit(exchange, 'OfferRemoved')
        .withArgs(1);

      const offers = await exchange.getOffers();
      expect(offers).lengthOf(2);

      expect(await token1.balanceOf(user1.address)).equals(balance - offer2Amount - offer3Amount);
      assertOffer(offers[0], {
        id: 3,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer3Amount,
        toToken: token2.address,
        toTokenAmount: 6,
      });
      assertOffer(offers[1], {
        id: 2,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer2Amount,
        toToken: token2.address,
        toTokenAmount: 4,
      });
    });

    it("Should cancel the offer when the offer is in the middle of the list", async function () {
      const offer1Amount = 10;
      const offer2Amount = 20;
      const offer3Amount = 30;
      const balance = await token1.balanceOf(user1.address);

      await exchange.connect(user1).createOffer(token1.address, offer1Amount, token2.address, 2);
      await exchange.connect(user1).createOffer(token1.address, offer2Amount, token2.address, 4);
      await exchange.connect(user1).createOffer(token1.address, offer3Amount, token2.address, 6);

      await expect(exchange.connect(user1).cancelOffer(2))
        .to.emit(exchange, 'OfferRemoved')
        .withArgs(2);

      const offers = await exchange.getOffers();
      expect(offers).lengthOf(2);

      expect(await token1.balanceOf(user1.address)).equals(balance - offer1Amount - offer3Amount);
      assertOffer(offers[0], {
        id: 1,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer1Amount,
        toToken: token2.address,
        toTokenAmount: 2,
      });
      assertOffer(offers[1], {
        id: 3,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer3Amount,
        toToken: token2.address,
        toTokenAmount: 6,
      });

    });

    it("Should cancel the offer when the offer is the last one in the list", async function () {
      const offer1Amount = 10;
      const offer2Amount = 20;
      const offer3Amount = 30;
      const balance = await token1.balanceOf(user1.address);

      await exchange.connect(user1).createOffer(token1.address, offer1Amount, token2.address, 2);
      await exchange.connect(user1).createOffer(token1.address, offer2Amount, token2.address, 4);
      await exchange.connect(user1).createOffer(token1.address, offer3Amount, token2.address, 6);

      await expect(exchange.connect(user1).cancelOffer(3))
        .to.emit(exchange, 'OfferRemoved')
        .withArgs(3);

      const offers = await exchange.getOffers();
      expect(offers).lengthOf(2);

      expect(await token1.balanceOf(user1.address)).equals(balance - offer1Amount - offer2Amount);
      assertOffer(offers[0], {
        id: 1,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer1Amount,
        toToken: token2.address,
        toTokenAmount: 2,
      });
      assertOffer(offers[1], {
        id: 2,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer2Amount,
        toToken: token2.address,
        toTokenAmount: 4,
      });
    });
  });

  describe("Buying offers", function () {

    it("Should raise an exception if the offer does not exist", async function () {
      await exchange.connect(user1).createOffer(token1.address, 1, token2.address, 2);
      await expect(exchange.connect(user1).buyOffer(12)).to.be.revertedWith("Unexisting offer ID");
    });

    it("Should raise an exception if the owner try to buy his own offer", async function () {
      await exchange.connect(user1).createOffer(token1.address, 1, token2.address, 2);
      await expect(exchange.connect(user1).buyOffer(1)).to.be.revertedWith("Owner cannot buy his own offer");
    });

    it("Should raise an exception if the buyer have not enough tokens to buy the offer", async function () {
      await exchange.connect(user1).createOffer(token1.address, 1, token2.address, TOKEN2_USER2_STARTING_BALANCE + 1);
      await expect(exchange.connect(user2).buyOffer(1)).to.be.revertedWith("Not enough tokens to buy");
    });

    it("Should raise an exception if the buyer has not allowed to move the required amount of tokens", async function () {
      const allowance = await token2.connect(user2).allowance(user2.address, exchange.address);
      await token2.connect(user2).decreaseAllowance(exchange.address, 1);

      await exchange.connect(user1).createOffer(token1.address, 1, token2.address, allowance);
      await expect(exchange.connect(user2).buyOffer(1)).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should buy the offer", async function () {
      const user1Token1balance = await token1.balanceOf(user1.address);
      const user1Token2balance = await token2.balanceOf(user1.address);
      const user2Token1balance = await token1.balanceOf(user2.address);
      const user2Token2balance = await token2.balanceOf(user2.address);
      const fromAmount = 100;
      const toAmount = 200;

      await exchange.connect(user1).createOffer(token1.address, fromAmount, token2.address, toAmount);

      await expect(exchange.connect(user2).buyOffer(1))
        .to.emit(exchange, 'OfferBought')
        .withArgs(1)
        .to.emit(exchange, 'OfferRemoved')
        .withArgs(1);

      expect(await token1.balanceOf(user1.address)).equal(user1Token1balance.sub(fromAmount));
      expect(await token1.balanceOf(user2.address)).equal(user2Token1balance.add(fromAmount));
      expect(await token2.balanceOf(user1.address)).equal(user1Token2balance.add(toAmount));
      expect(await token2.balanceOf(user2.address)).equal(user2Token2balance.sub(toAmount));
      expect(await exchange.getOffers()).lengthOf(0);
    });
  });
});