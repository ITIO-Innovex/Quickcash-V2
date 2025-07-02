const express = require('express');
const router  = express.Router();
const coinController = require('../../controllers/Admin/coin.controller');

const { 
  addCoin,
  coinList, 
  getAllCoins,
  updateCoin,
  upload,
  deleteCoin,
  setDefaultCoin,
} = coinController;

const { verifyToken } = require('../../middlewares/admin.middleware');

// Route to add a coin
router.route('/add').post(verifyToken, addCoin);
// Route to fetch all coins from Fireblocks
router.route('/list').get(verifyToken, coinList);
// route to fetch coins from db
router.route('/').get(verifyToken, getAllCoins) ;
// Update coin route
router.put("/update-coin/:coinId", verifyToken, upload.single("logo"), updateCoin);
// Route to delete (disable) a coin
router.route('/delete/:id').delete( verifyToken, deleteCoin);
// New route to set a default coin
router.route('/set-default/:coinId').patch(verifyToken, setDefaultCoin);


module.exports = router;
