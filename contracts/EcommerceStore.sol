pragma solidity ^0.4.23;
import "contracts/Escrow.sol";

contract EcommerceStore{
    enum ProductCondition {New, Used}
    
    uint public ProductIndex;
    
    address  public arbiter;

    mapping(address => mapping(uint => Product)) stores;
    mapping(uint=> address) productIdInStore;
    
    mapping (uint=>address) productEscrow;
    struct Product {
        uint id;
        string name;
        string catelogy;
        string imgLink;
        string descLink;
        uint startTime;
        uint price;
        ProductCondition condition;
        address buyer;
    }
    constructor(address _arbiter) public {
        ProductIndex=0;
        arbiter = _arbiter;
    }
    
    function addProductInStore(string _name, string _catelogy, string _imgLink, string descLink, uint _startTime, uint _price, uint _condition) public{
        ProductIndex +=1;
        Product memory product = Product(ProductIndex, _name,  _catelogy, _imgLink, descLink, _startTime, _price,ProductCondition(_condition), 0);
    
        stores[msg.sender][ProductIndex] = product;
        productIdInStore[ProductIndex] = msg.sender;
    }
    
    function getproduct(uint _producID) public view returns (uint, string, string , string, string, uint, uint, ProductCondition, address) {
        Product memory product = stores[productIdInStore[_producID]][_producID];
        return (product.id, product.name, product.catelogy, product.imgLink,product.descLink, product.startTime, product.price, product.condition, product.buyer);
        
    }
    
    function buy(uint _productId) payable public {
        Product memory product = stores[productIdInStore[_productId]][_productId]; // lấy product theo id 
        require(product.buyer == address(0)); // kiểm tra sản phẩm chưa được mua 
        require(msg.value >= product.price); // kiểm tra số tiền có đủ để mua sản phẩm này không 
        product.buyer = msg.sender; // để xác định ai là người mua sản phẩm này  
        stores[productIdInStore[_productId]][_productId] = product; // cập nhật lại thông tin về cửa hàng về sản phẩm 

        Escrow escrow = (new Escrow).value(msg.value)(_productId, msg.sender, productIdInStore[_productId], arbiter);
        productEscrow[_productId] = escrow;
    }

    function escrowInfo(uint _productId) view public returns (address, address, address, bool, uint, uint){
        return Escrow(productEscrow[_productId]).escrowInfo();
    }


    function refundAmountToBuyer(uint _productId) public {
        Escrow(productEscrow[_productId]).refundAmountToBuyer(msg.sender);
    }

    function releaseAmountToSeller(uint _productId) public {
        Escrow(productEscrow[_productId]).releaseAmountToSeller(msg.sender);
    }


}