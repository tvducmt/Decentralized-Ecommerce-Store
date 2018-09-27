// Import the page's CSS. Webpack will know what to do with it.
import "../styles/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

const ipfsAPI = require('ipfs-api');
const ipfs= ipfsAPI({host: 'localhost', port: '5001', protocol: 'http' });
// Import our contract artifacts and turn them into usable abstractions.
import ecommerce_store_artifacts from '../../build/contracts/EcommerceStore.json'


// MetaCoin is our usable abstraction, which we'll use through the code below.
var EcommerceStore = contract(ecommerce_store_artifacts);

var reader;
window.App = {
 start: function() {
  var self = this;

  // Bootstrap the MetaCoin abstraction for Use.
    EcommerceStore.setProvider(web3.currentProvider);
    //Check xem trang hiện tại là trang home hay trang product detail
    if($('#product-details').length > 0) {
        //là trang product detail
        let productId = new URLSearchParams(window.location.search).get('id');
        console.log(productId);
        renderProductDetail(productId);
    } else {
        //Nếu là trang home
        renderStore();
    }
    $("#product-image").change(function(event){
        const file = event.target.files[0];
        reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
    });
    $("#add-item-to-store").submit(function(event){
        const req = $("#add-item-to-store").serialize();
        let paras = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g,'","').replace(/=/g,'":"')+'"}');
        let decodedparams ={}
        Object.keys(paras).forEach(function(v){
            decodedparams[v]= decodeURIComponent(decodeURI(paras[v]));
        });
        console.log(decodedparams);
        saveProduct(decodedparams);
        event.preventDefault();
    });

    $("#buy-now").submit(function(event){
        $("#msg").hide();
        var sendAmount = $("#buy-now-price").val();
        var productId = $("#product-id").val();
        EcommerceStore.deployed().then(function(i){
            i.buy(productId, {value: sendAmount, from: web3.eth.accounts[0], gas: 440000}).then(function(f){
                $("#msg").show();
                $("#msg").html("You have successfully purchased the product");
            })
        });
        event.preventDefault()
    });
 
  } 
};


function renderProductDetail (productId) {
    EcommerceStore.deployed().then(function(f) {
        f.getproduct.call(productId).then(function(p) {
            $('#product-name').html(p[1]);
            $('#product-image').html("<img src='http://localhost:8080/ipfs/"+p[3] +"'/>");
            $('#product-description').html("<img src='http://localhost:8080/ipfs/"+p[4] +"'/>");
            $('#product-price').html(displayPrice(p[6]));
            //Set value nên dùng val
            $('#product-id').val(p[0]);
            $('#buy-now-price').val((p[6]));
        }) 

    })
}

function saveProduct(product){
    // 1. Upload image to ipfs and get hash 
    // 2. Add description to ipfs and get the hash 
    // 3. pass 2 hash to addProductInStore
    var imageId;
    var descId;
    saveImageOnIpfs(reader).then(function(id){
        imageId = id;
        saveTextBlobOnIpfs(product["product-description"]).then(function(id){
            descId = id;
            EcommerceStore.deployed().then(function(f){
                return f.addProductInStore(product["product-name"], product["product-category"], imageId, descId, Date.parse(product["product-start-time"])/1000, web3.toWei(product["product-price"], 'ether'), product["product-condition"], {from: web3.eth.accounts[0], gas:4700000});
            }).then(function(f){
                alert("Product added to store !");
            });
        })
    })
}

function saveImageOnIpfs (reader) {
    return new Promise(function(resolve, reject) {
        const buffer = Buffer.from(reader.result);
        ipfs.add(buffer)
        .then((response) => {
            console.log(response);
            resolve(response[0].hash);
        }).catch(err => {
            console.log(err);
            reject(err);
        })
    })
 }
 
 function saveTextBlobOnIpfs(blob) {
    return new Promise(function(resolve, reject) {
        const buffer = Buffer.from(blob, 'utf-8');
        ipfs.add(buffer)
        .then((response) => {
            console.log(response);
            resolve(response[0].hash);
        }).catch(err => {
            console.log(err);
            reject(err);
        })
    })
 }

 
function renderStore(){
    var instance;
    return EcommerceStore.deployed().then(function(f){
        instance=f;
        return instance.ProductIndex.call();
    }).then(function(count){
        for (var i=1;i<= count; i++ ){
            renderProduct(instance, i);
        }
    });
}

function renderProduct(instance, index){
    instance.getproduct.call(index).then(function(f){
       let node = $("<div/>");
       node.addClass("col-sm-3 text-center col-margin-botton-1 product");
       node.append("<img src='http://localhost:8080/ipfs/"+f[3] +"'/>");
       node.append("<div class='title'> " +f[1]+"<div/>");
       node.append("<div> Price: "+ displayPrice(f[6])+ "<div/>");
       node.append("<a href = 'product.html?id="+ f[0] + "'>Details<div/>")
       if (f[8]=="0x0000000000000000000000000000000000000000"){
           $("#product-list").append(node);
       }else{
           $("#product-purchased").append(node);
       }
        //console.log(f);
    });
}

function displayPrice(amt){
    return "&Xi;"+ web3.fromWei(amt, 'ether');
}
window.addEventListener('load', function() {
 // Checking if Web3 has been injected by the browser (Mist/MetaMask)
 if (typeof web3 !== 'undefined') {
  console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
  // Use Mist/MetaMask's provider
  window.web3 = new Web3(web3.currentProvider);
 } else {
  console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
 }

 App.start();
});