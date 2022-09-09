//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token5 is ERC20 {
    constructor() ERC20("Token5", "TK5") {
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }
    function decimals() public view virtual override returns (uint8) {
        return 5;
    }
}
