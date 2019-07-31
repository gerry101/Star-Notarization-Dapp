import Web3 from "web3";
import starNotarizeArtifact from "../../build/contracts/StarNotarize.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotarizeArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotarizeArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  getStarName: async function() {
    const { starName } = this.meta.methods;
    const currentStarName = await starName().call();
    const starNameParagraph = document.getElementById('starName');
    starNameParagraph.innerHTML = currentStarName;
  },

  getStarOwner: async function() {
    const { starOwner } = this.meta.methods;
    const currentStarOwner = await starOwner().call();
    const starOwnerParagraph = document.getElementById('starOwner');
    starOwnerParagraph.innerHTML = currentStarOwner;
  },

  claimStar: async function() {
    const { claimStar } = this.meta.methods;
    await claimStar().send({from: this.account});
    this.setStatus('Claim star function has completed');
  },

  renameStar: async function() {
    const newStarOwner = document.getElementById('changeStarName').value;

    if(newStarOwner.trim()) {
      const { changeStarName } = this.meta.methods;
      await changeStarName(newStarOwner).send({from: this.account});
      document.getElementById('changeStarName').value = "";
      this.setStatus('Rename star function has completed');
    } else {
      this.setStatus('Please provide a new name for the star!');
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
