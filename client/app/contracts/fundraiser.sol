// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Fundraiser {
    uint256 goal;
    uint expires;
    bool funds_withdrawn = false;
    mapping (address => bool) private Wallets;
    mapping (address => uint256) private Deposits;

    function setWallet(address _wallet) private{
        Wallets[_wallet]=true;
    }

    function getStatus() public view returns (uint256, bool, uint, uint256) {
        return (address(this).balance, funds_withdrawn, expires, goal);
    }

    function is_owner(address _wallet) private view returns (bool){
        return Wallets[_wallet];
    }
    
    constructor(address _owner1, address _owner2, address _owner3, uint256 _goal, uint256 _timelimit_seconds) {
        require(_owner1 != _owner2, "Owners must be different");
        require(_owner2 != _owner3, "Owners must be different");
        require(_owner1 != _owner3, "Owners must be different");
        setWallet(_owner1);
        setWallet(_owner2);
        setWallet(_owner3);
        goal = _goal;
        expires = block.timestamp + _timelimit_seconds;
    }

    function fund(uint256 amount) payable public {
        require(block.timestamp <= expires, "Fund is expired, no more funding is allowed");
        require(msg.value == amount, "Amount does not equal message value");
        Deposits[msg.sender] += amount;
    }
    
    function getContractBalance() public view returns (uint256) { //view amount of ETH the contract contains
        return address(this).balance;
    }

    function withdraw(address payable dest, bytes32 r, bytes32 s, uint8 v) public { // withdraw all ETH previously sent to this contract
        require(address(this).balance >= goal, "Funding goal has not been reached");
        require(block.timestamp > expires, "Funding is not finished yet, can only withdraw when time goal is reached");
        require(is_owner(msg.sender), "You are not authorized to withdraw");
        
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 message = keccak256(abi.encodePacked(dest, address(this)));
        bytes32 messageHash = keccak256(abi.encodePacked(prefix, message));
        
        address second_signer = ecrecover(messageHash, v, r, s);
        
        require(is_owner(second_signer), "Signed message signer is not authorized to withdraw or accounts for withdrawal don't match.");
        require(msg.sender != second_signer, "Second signer must be different than executing account");

        funds_withdrawn = true;
        
        selfdestruct(dest);
    }


    function refund() public {
        require(block.timestamp > expires, "Refunds can only be requested after the time limit expires");
        require(funds_withdrawn == false && address(this).balance < goal, "Funding was successful - No refunds");
        uint256 amount = Deposits[msg.sender];
        require(amount != 0, "You do not have any funding to withdraw");
        Deposits[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
