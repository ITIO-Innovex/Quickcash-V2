const express = require('express');
const router = express.Router();
const { 
  createWalletAddress,
  getWalletAddress,
  updateTransaction,
  addTransaction,
  openSwapOrders,
  adminlistbyid,
  calculateCrypto,
  addSwapOrder,
  listByCoinId,
  fetchNoOfCoins,
  calculateSymbolPrice,
  fetchExchangeValues,
  sellCrypto,
  adminlist,
  benefetchExchangeValues,
  list, 
  getCoinGeckoIDs,
updateCoinList,
fetchSwapCoins,
getCoinConversionRate,
fetchCoins,
updateSwapAmount,
 } = require('../controllers/crypto.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/add').post(verifyToken,addTransaction);
router.route('/sell').post(verifyToken,sellCrypto);
router.route('/getdetails/:id').get(verifyToken,adminlistbyid);
router.route('/list/:id').get(verifyToken,list);
router.route('/listbyId/:id').get(verifyToken,listByCoinId);
router.route('/translist').get(verifySecondaryToken,adminlist);
router.route('/trans/:id').get(verifySecondaryToken,adminlistbyid);
router.route('/requestWalletAddress/:accountid/:assetid').get(createWalletAddress);
router.route('/getwalletAddress/:id/:email').get(verifyToken,getWalletAddress);
router.route('/swap').post(verifyToken,addSwapOrder);
router.route('/crypto-update').patch(verifySecondaryToken,updateTransaction);
router.route('/swap/open/:id').get(verifyToken,openSwapOrders);
router.route('/fetch-calculation').post(verifyToken,calculateCrypto);
router.route('/fetch-coins/:id').get(verifyToken,fetchNoOfCoins);
router.route('/fetch-symbolprice').post(verifyToken,calculateSymbolPrice);
router.route('/fetch-exchangeValues').post(verifyToken,fetchExchangeValues);
router.route('/fetch-beneexchange').post(verifyToken,benefetchExchangeValues);
// Route to fetch CoinGecko IDs
router.route('/get-coin-gecko-ids').get( verifyToken, getCoinGeckoIDs);
// Route request to update coins 
router.route('/update-coin-list').post(verifyToken, updateCoinList); 
// Route for fetching coins from collection
router.route('/fetchswapcoins').get( verifyToken ,fetchSwapCoins);
// Route to fetch conversion rates between two coins
router.route('/convert-coin').post(verifyToken,  getCoinConversionRate);
// Route to fetch no of coins user have 
router.route("/fetch-no-of-coins").post( verifyToken, fetchCoins);
// Route to swap COins
router.route("/updateswap").post(verifyToken, updateSwapAmount);

module.exports = router;