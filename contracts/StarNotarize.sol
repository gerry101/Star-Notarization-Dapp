pragma solidity >=0.4.21 <0.6.0;

contract StarNotarize {
    string public starName;
    address public starOwner;

    event StarClaimed(address _starOwner);

    constructor() public {
        starName = "Cool star!";
    }

    function claimStar() public {
        starOwner = msg.sender;
        emit StarClaimed(starOwner);
    }

    function changeStarName(string memory _starName) public {
        starName = _starName;
    }
}