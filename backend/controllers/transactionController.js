const Transaction = require('../models/Transaction');

exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, note, date } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const transaction = new Transaction({
      user: req.user.id, // Links transaction to the specific user
      type,
      amount: parseFloat(amount),
      category: category || "Other",
      note: note || "",
      date: date || Date.now()
    });

    await transaction.save();
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const User = require('../models/User');

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
    const user = await User.findById(userId); // Fetch user to get limit
    res.json({ success: true, transactions, user: { limit: user.limit } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};