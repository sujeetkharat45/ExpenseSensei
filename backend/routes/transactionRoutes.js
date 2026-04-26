const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addTransaction, getTransactions } = require('../controllers/transactionController');

// Add a new transaction (income or expense)
router.post('/', auth, addTransaction);

// Get all transactions for the logged-in user
router.get('/', auth, getTransactions);

module.exports = router;
