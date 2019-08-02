const StarNotarize = artifacts.require("StarNotarize");

let accounts;
let owner;

contract("StarNotarize", accs => {
    accounts = accs;
    owner = accounts[0];
});

it("Tests that the initial star is called 'Cool star!'", async () => {
    const instance = await StarNotarize.deployed();
    const starName = await instance.starName();
    assert.equal("Cool star!", starName);
});

it("Tests that the star can be claimed", async () => {
    const instance = await StarNotarize.deployed();
    await instance.claimStar({from: owner});
    const starOwner = await instance.starOwner();
    assert.equal(owner, starOwner);
});

it("Tests that the star can be reclaimed", async () => {
    const instance = await StarNotarize.deployed();
    await instance.claimStar({from: owner});
    await instance.claimStar({from: accounts[1]});
    const starOwner = await instance.starOwner({from: accounts[1]});
    assert.equal(accounts[1], starOwner);
});

it("Tests that the star name can be changed", async () => {
    const instance = await StarNotarize.deployed();
    const newStarName = "Even Cooler Star Here!";
    await instance.changeStarName(newStarName, {from: owner});
    const updatedStarName = await instance.starName();
    assert.equal(newStarName, updatedStarName);
});