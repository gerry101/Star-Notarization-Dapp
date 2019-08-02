pragma solidity >=0.4.21 <0.6.0;

import "../app/node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";

contract StarNotary is ERC721Full {
    struct Star {
        string name;
    }

    mapping(uint256 => Star) public tokenIdToStarData;
    mapping(uint256 => uint256) public tokensOnSale;

    constructor() ERC721Full("Nostary", "NST") public {
    }

    function createStar(string memory _starName, uint256 _starTokenId) public {
        Star memory newStar = Star(_starName);

        tokenIdToStarData[_starTokenId] = newStar;

        _mint(msg.sender, _starTokenId);
    }

    function putStarForSale(uint256 _starTokenId, uint256 _starSellingPrice) public {
        require(ownerOf(_starTokenId) == msg.sender, "Your address should own the token");

        tokensOnSale[_starTokenId] = _starSellingPrice;
    }

    function buyStar(uint256 _starTokenId) payable public {
        require(_exists(_starTokenId) == true, "The token specified should exist");

        uint256 starPrice = tokensOnSale[_starTokenId];

        require(starPrice > 0, "The token should be on sale");

        address starOwner = ownerOf(_starTokenId);
        address starOwnerIntent = msg.sender;
        address payable starOwnerPayableAddress = address(uint160(starOwner));
        address payable starOwnerIntentPayableAddress = address(uint160(starOwnerIntent));
        require(starOwner != starOwnerIntent, "The token should not be owned by your address");
    
        require(msg.value >= starPrice, "You should have enough ether to purchase this token");

        starOwnerPayableAddress.transfer(starPrice);
        _transferFrom(starOwner, starOwnerIntent, _starTokenId);

        if(msg.value > starPrice) {
            starOwnerIntentPayableAddress.transfer(msg.value - starPrice);
        }

        tokensOnSale[_starTokenId] = 0;
    }
}