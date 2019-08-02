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