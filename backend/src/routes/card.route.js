const express = require('express');
const router = express.Router();
const { 
    addCard,
    cardList, 
    cardById, 
    changePin,
    addCardApi,
    updateCard,
    deleteCard,
    updateCardApi,
    addMoney,
    toggleFreezeCard,
    updateCardLimit,
    updateAmountById
} = require('../controllers/card.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Existing routes...
router.route('/add').post(verifyToken, addCard);
router.route('/list/:id').get(verifyToken, cardList);
router.route('/:id').get(verifyToken, cardById);
router.route('/change-pin').patch(verifyToken, changePin);
router.route('/update/:id').patch(verifyToken, updateCard);
router.route('/delete/:id').delete(verifyToken, deleteCard);

// Mobile App route
router.route('/add-app').post(verifyToken, addCardApi);
router.route('/updateapp/:id').patch(verifyToken, updateCardApi);

// New route for adding money
router.route('/addmoney').post(verifyToken, addMoney); 

// New route for freezing a card toggle
router.route('/toggle-freeze-card/:id').patch(verifyToken, toggleFreezeCard);

// New route for updating daily and monthly card limits
router.route('/limit/:id').put(verifyToken, updateCardLimit); 

// Define the route to update the amount on a card by its ID
router.route('/update-amount/:id').patch(verifyToken, updateAmountById); 

module.exports = router;
