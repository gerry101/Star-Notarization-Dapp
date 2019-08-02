const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;

contract("StarNotary", acc => {
    accounts = acc;
    owner = accounts[0];
});

it("Correctly sets the name of the token", async () => {
    const instance = await StarNotary.deployed();
    const tokenName = "Nostary";
    const retrievedTokenName = await instance.name();
    assert.equal(tokenName, retrievedTokenName);
});

it("Correctly sets the symbol of the token", async () => {
    const instance = await StarNotary.deployed();
    const tokenSymbol = "NST";
    const retrievedTokenSymbol = await instance.symbol();
    assert.equal(tokenSymbol, retrievedTokenSymbol);
});

it("Creates a star successfuly", async () => {
    const instance = await StarNotary.deployed();
    const starName = "Cool star name!";
    const starTokenId = "1";
    await instance.createStar(starName, starTokenId, {from: owner});
    const starTokenName = await instance.tokenIdToStarData(starTokenId);
    assert.equal(starName, starTokenName);
});

it("Correctly puts up a star for sale", async () => {
    const instance = await StarNotary.deployed();
    const starName = "Cool star name!";
    const starTokenId = "2";
    const starTokenPrice = await web3.utils.toWei(".01", "ether");
    await instance.createStar(starName, starTokenId, {from: owner});
    await instance.putStarForSale(starTokenId, starTokenPrice, {from: owner});
    const retrievedStarTokenPrice = await instance.tokensOnSale(starTokenId);
    assert.equal(starTokenPrice, retrievedStarTokenPrice);
});

it("Allows a user to buy a star", async () => {
    const instance = await StarNotary.deployed();
    const starName = "Cool star name!";
    const starTokenId = "3";
    const starTokenPrice = await web3.utils.toWei(".01", "ether");
    await instance.createStar(starName, starTokenId, {from: owner});
    await instance.putStarForSale(starTokenId, starTokenPrice, {from: owner});
    const buyingUser = accounts[1];
    const buyingUserBalance = await web3.utils.toWei(".05", "ether");
    await instance.buyStar(starTokenId, {from: buyingUser, value: buyingUserBalance});
    const starTokenOwner = await instance.ownerOf(starTokenId);
    assert.equal(buyingUser, starTokenOwner);
});

it("Ensures that the buyer is correctly billed for a star token", async () => {
    const instance = await StarNotary.deployed();
    const starName = "Cool star name!";
    const starTokenId = "4";
    const starTokenPrice = await web3.utils.toWei(".01", "ether");
    await instance.createStar(starName, starTokenId, {from: owner});
    await instance.putStarForSale(starTokenId, starTokenPrice, {from: owner});
    const buyingUser = accounts[1];
    const buyingUserBalance = await web3.utils.toWei(".01", "ether");
    const buyingUserInitialBalance = await web3.eth.getBalance(buyingUser);
    await instance.buyStar(starTokenId, {from: buyingUser, value: buyingUserBalance, gasPrice: 0});
    const buyingUserFinalBalance = await web3.eth.getBalance(buyingUser);
    const buyingConfirmationBalance = Number(buyingUserFinalBalance) + Number(starTokenPrice);
    assert.equal(Number(buyingUserInitialBalance), buyingConfirmationBalance);
});

it("Ensures that the seller is correctly debited for selling the star token", async () => {
    const instance = await StarNotary.deployed();
    const starName = "Cool star name!";
    const starTokenId = "5";
    const starTokenPrice = await web3.utils.toWei(".01", "ether");
    await instance.createStar(starName, starTokenId, {from: owner});
    await instance.putStarForSale(starTokenId, starTokenPrice, {from: owner});
    const buyingUser = accounts[1];
    const buyingUserBalance = await web3.utils.toWei(".05", "ether");
    const sellerInitialBalance = await web3.eth.getBalance(owner);
    await instance.buyStar(starTokenId, {from: buyingUser, value: buyingUserBalance, gasPrice: 0});
    const sellerFinalBalance = await web3.eth.getBalance(owner);
    const sellerConfirmationBalance = Number(sellerFinalBalance) - Number(starTokenPrice);
    assert.equal(sellerInitialBalance, sellerConfirmationBalance);
});

it("Tests that a star's name can be correctly retrieved using 'lookupStarInfo'", async () => {
    const instance = await StarNotary.deployed();
    const starName = "Cool star name!";
    const starTokenId = "6";
    await instance.createStar(starName, starTokenId, {from: owner});
    const starTokenName = await instance.lookupStarInfo(starTokenId, {from: owner});
    assert.equal(starName, starTokenName);
});

it("Tests that stars can be exchanged using 'exchangeStars'", async () => {
    const instance = await StarNotary.deployed();
    const starName = "Cool star name!";
    const starTokenId = "7";
    await instance.createStar(starName, starTokenId, {from: owner});
    const starName_2 = "Cool star name 2!";
    const starTokenId_2 = "8";
    await instance.createStar(starName_2, starTokenId_2, {from: accounts[1]});
    await instance.approve(accounts[1], starTokenId, {from: owner});
    await instance.exchangeStars(owner, starTokenId, accounts[1], starTokenId_2, {from: accounts[1]});
    const starOwnerAddress = await instance.ownerOf(starTokenId);
    assert.equal(accounts[1], starOwnerAddress);
});