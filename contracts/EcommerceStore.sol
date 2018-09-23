pragma solidity ^0.4.23;

contract EcommerceStore{
    enum ProductCondition {New, Used}
    uint public ProductIndex;
    mapping(address => mapping(uint => Product)) stores;
    mapping(uint=> address) productIdInStore;
    
    struct Product {
        uint id;
        string name;
        string catelogy;
        string imgLink;
        uint startTime;
        uint price;
        ProductCondition condition;
        address buyer;
    }
    constructor() public {
        ProductIndex=0;
    }
    
    function addProductInStore(string _name, string _catelogy, string _imgLink, uint _startTime, uint _price, uint _condition) public{
        ProductIndex +=1;
        Product memory product = Product(ProductIndex, _name,  _catelogy, _imgLink,  _startTime, _price,ProductCondition(_condition), 0);
    
        stores[msg.sender][ProductIndex]= product;
        productIdInStore[ProductIndex]= msg.sender;
    }
    
    function getproduct(uint _producID) public view returns (uint, string, string , string, uint, uint, ProductCondition, address) {
        Product memory product= stores[productIdInStore[_producID]][_producID];
        return (product.id, product.name, product.catelogy, product.imgLink, product.startTime, product.price, product.condition, product.buyer);
        
    }
    
}