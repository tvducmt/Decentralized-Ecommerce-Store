//var ConvertLib = artifacts.require('./ConvertLib.sol')
//var MetaCoin = artifacts.require('./MetaCoin.sol')
var EcommerceStore = artifacts.require('./EcommerceStore.sol')

module.exports = function (deployer) {
  //deployer.deploy(ConvertLib)
  //deployer.link(ConvertLib, MetaCoin)
  //deployer.deploy(MetaCoin)
  deployer.deploy(EcommerceStore, web3.eth.accounts[9]);
}
