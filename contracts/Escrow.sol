pragma solidity ^0.4.23;

contract Escrow {
    //Địa chỉ người mua
    address public buyer;
    //Địa chỉ người bán
    address public seller;
    //Địa chỉ người phán xử
    address public arbiter;
    
    address public owner;
    uint public productId;  //Id sản phẩm
    uint public amount;  // số lượng ether
    mapping(address => bool) releaseAmount; //Địa chỉ ứng với việc đồng ý giải ngân
    mapping(address => bool) refundAmount; //Địa chỉ ứng với việc đồng ý hoàn lại tiền
    uint public releaseCount; // Số lượng người đồng ý release
    uint public refundCount; // Số người đống ý hoàn lại tiền
    
    bool public fundsDisbursed; // Hàm này kiểm tra vấn đề đã được giải quyết chưa

    
    constructor (uint _productId, address _buyer, address _seller, address _arbiter) payable public {
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
        fundsDisbursed = false;
        amount = msg.value;
        owner = msg.sender;
        productId = _productId;
    }
    
    //Lấy thông tin Escrow
    
    function escrowInfo() view public returns (address, address, address, bool, uint, uint) {
        return (buyer, seller, arbiter, fundsDisbursed, releaseCount, refundCount);
    }
    
    function releaseAmountToSeller(address caller) public {
        require(fundsDisbursed == false);
        require(msg.sender == owner);
        if ((caller == buyer || caller == seller || caller == arbiter) && releaseAmount[caller] != true) {
            releaseAmount[caller] = true;
            releaseCount += 1;
        }
        //Nếu hai người gọi
        if (releaseCount == 2) {
            //
            seller.transfer(amount);
            fundsDisbursed = true;
        }
    }
    
    function refundAmountToBuyer(address caller) public {
        require(fundsDisbursed == false);
        require(msg.sender == owner);
        if ((caller == buyer || caller == seller || caller == arbiter) && refundAmount[caller] != true) {
            refundAmount[caller] = true;
            refundCount += 1;
        }
        if(refundCount == 2) {
            buyer.transfer(amount);
            fundsDisbursed = true;
        }
    }
}
