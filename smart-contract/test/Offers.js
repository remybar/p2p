const { expect } = require("chai");
const { ethers } = require("hardhat");

let chai = require('chai');
chai.use(require('chai-string'));

function assertOffer(offer, expectedOffer) {
    // ignore offer.id as it is interally set by the smart contract
    expect(offer.owner).equalIgnoreCase(expectedOffer.owner);
    expect(offer.fromToken).equalIgnoreCase(expectedOffer.fromToken);
    expect(offer.fromTokenAmount).equal(expectedOffer.fromTokenAmount);
    expect(offer.toToken).equalIgnoreCase(expectedOffer.toToken);
    expect(offer.toTokenAmount).equal(expectedOffer.toTokenAmount);
  }

describe("Offers", function () {

    let offersMockFactory, offersMock;
    let addOffers;

    // some fake users
    const user1 = "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";;
    const user2 = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";;

    // some fake tokens
    const token1 = "0x1111111111111111111111111111111111111111";
    const token2 = "0x2222222222222222222222222222222222222222";

    // some fake offers
    const fakeOffers = [
        {id: 0, owner: user1, fromToken: token1, fromTokenAmount: 1, toToken: token1, toTokenAmount: 2},
        {id: 0, owner: user2, fromToken: token1, fromTokenAmount: 3, toToken: token1, toTokenAmount: 4},
        {id: 0, owner: user1, fromToken: token1, fromTokenAmount: 5, toToken: token1, toTokenAmount: 6},
        {id: 0, owner: user2, fromToken: token2, fromTokenAmount: 7, toToken: token2, toTokenAmount: 8},
        {id: 0, owner: user1, fromToken: token2, fromTokenAmount: 9, toToken: token2, toTokenAmount: 10},
        {id: 0, owner: user2, fromToken: token2, fromTokenAmount: 11, toToken: token2, toTokenAmount: 12},
    ]
    const [fakeOffer1, fakeOffer2] = fakeOffers;

    before(async () => {
        offersMockFactory = await ethers.getContractFactory("OffersMock");
    });
    
    beforeEach(async () => {
        offersMock = await offersMockFactory.deploy();
        await offersMock.deployed();
    })

    describe("Adding offers", function () {
        it("Should add the offer when there is no offer yet", async function () {
            await offersMock.add(fakeOffer1);
            const offers = await offersMock.getAll();

            expect(offers).length(1);
            expect(offers[0].id).equal(1);
            assertOffer(offers[0], fakeOffer1);
        });

        it("Should add the offer correctly when there is already an offer in the list", async function () {
            await offersMock.add(fakeOffer1);
            await offersMock.add(fakeOffer2);

            const offers = await offersMock.getAll();

            expect(offers).length(2);
            expect(offers[0].id).equal(1);
            expect(offers[1].id).equal(2);
            assertOffer(offers[0], fakeOffer1);
            assertOffer(offers[1], fakeOffer2);
        });
    
        it("Should add the offer correctly when another offer has been removed from the list before", async function () {
            await offersMock.add(fakeOffer1);
            await offersMock.remove(1);
            await offersMock.add(fakeOffer2);

            const offers = await offersMock.getAll();

            expect(offers).length(1);
            expect(offers[0].id).equal(2);
            assertOffer(offers[0], fakeOffer2);        
        });

         it("Should add several offers correctly", async function () {
            for (const offer of fakeOffers) {
                await offersMock.add(offer);
            }

            const offers = await offersMock.getAll();

            expect(offers.length).equal(fakeOffers.length);

            for (i = 0; i < offers.length; i++) {
                expect(offers[i].id).equal(i + 1);
                assertOffer(offers[i], fakeOffers[i]);        
            }
        });
    });

    describe("Removing offers", function () {
        // TODO: add tests for remove()
    });

    describe("Containing offers", function () {

        beforeEach(async() => {
            for (const offer of fakeOffers) {
                await offersMock.add(offer);
            }
        })

        it ("Should contain an offer previously added in the list", async function () {
            for (let i = 1; i <= fakeOffers.length; i++ ) {
                const result = await offersMock.contains(i);
                expect(result).to.be.true;
            }

            const result = await offersMock.contains(fakeOffers.length + 1);
            expect(result).to.be.false;
        });

        it ("Should not contain an offer previously removed from the list", async function () {
            const removedOfferId = 2;

            await offersMock.remove(removedOfferId);

            for (let i = 1; i <= fakeOffers.length; i++ ) {
                const result = await offersMock.contains(i);
                expect(result).to.be.equal(i !== removedOfferId);
            }
        });
    });

    describe("Getting offers", function () {

        beforeEach(async() => {
            for (const offer of fakeOffers) {
                await offersMock.add(offer);
            }
        })

        it ("Should not get an offer with a bad ID", async function () {
            await expect(offersMock.get(0)).to.be.revertedWith("Invalid offer ID");
        });

        it ("Should not get an offer if not in the list", async function () {
            await expect(offersMock.get(45)).to.be.revertedWith("Unexisting offer ID");
        });

        it ("Should get an offer from the beginning of the list", async function () {
            const expectedId = 1;
            const expectedOffer = fakeOffers[expectedId - 1];

            const offer = await offersMock.get(expectedId);

            expect(offer.id).equal(expectedId);
            assertOffer(offer, expectedOffer);
        });

        it ("Should get an offer from the middle of the list", async function () {
            const expectedId = 3;
            const expectedOffer = fakeOffers[expectedId - 1];

            const offer = await offersMock.get(expectedId);

            expect(offer.id).equal(expectedId);
            assertOffer(offer, expectedOffer);
        });

        it ("Should get an offer from the end of the list", async function () {
            const expectedId = fakeOffers.length;
            const expectedOffer = fakeOffers[expectedId - 1];

            const offer = await offersMock.get(expectedId);

            expect(offer.id).equal(expectedId);
            assertOffer(offer, expectedOffer);
        });
    });
});
