import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  createStarToken: async function() {
    const { createStar } = this.meta.methods;
    const starName = document.getElementById('starTokenName').value;
    const starTokenId = document.getElementById('creationTokenId').value;
    if(starName.trim() && starTokenId.trim()) {
      try {
        await createStar(starName, starTokenId).send({from: this.account});
      } catch(err) {
        this.setStatus(err.message.split("Error:")[err.message.split("Error:").length - 1]);
      }
    } else {
      this.invalidInputsStatus();
    }
  },

  putUpStarSale: async function() {
    const { putStarForSale } = this.meta.methods;
    const starTokenId = document.getElementById('sellingTokenId').value;
    const starSellingPrice = parseInt(document.getElementById('sellingPrice').value);
    if(starTokenId.trim()) {
      if(starSellingPrice && starSellingPrice > 0) {
        const starSellingPriceWei = await this.web3.utils.toWei(starSellingPrice.toString(), "ether");
        try {
          await putStarForSale(starTokenId, starSellingPriceWei).send({from: this.account});
        } catch(err) {
          this.setStatus(err.message.split("Error:")[err.message.split("Error:").length - 1]);
        }
      } else {
        this.setStatus("Kindly specify a valid selling price.");
      }
    } else {
      this.invalidInputsStatus();
    }
  },

  buyStar: async function() {
    const { buyStar, tokensOnSale } = this.meta.methods;
    const starTokenId = document.getElementById('buyingTokenId').value;
    if(starTokenId.trim()) {
      try {
        this.setStatus("Initiating transaction ...");
        const starSellingPriceWei = await tokensOnSale(starTokenId).call();
        await buyStar(starTokenId).send({from: this.account, value: starSellingPriceWei});
        this.setStatus("Transaction complete.");
      } catch(err) {
        this.setStatus(err.message.split("Error:")[err.message.split("Error:").length - 1]);
      }
    } else {
      this.invalidInputsStatus();
    }
  },

  lookupStar: async function() {
    const { lookupStarInfo } = this.meta.methods;
    const starTokenId = document.getElementById('lookupTokenId');
    if(starTokenId.trim()) {
      try {
        const starName = await lookupStarInfo(starTokenId).send({from: this.account});
        this.setStatus('The star you looked up is named ' + starName);
      } catch(err) {
        this.setStatus(err.message.split("Error:")[err.message.split("Error:").length - 1]);
      }
    } else {
      this.invalidInputsStatus();
    }
  },

  invalidInputsStatus: function() {
    const status = document.getElementById("status");
    status.innerHTML = "Kindly specify valid input values in the input fields.";
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
