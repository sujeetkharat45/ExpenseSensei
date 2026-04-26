const Goal = require("../models/Goal");
exports.createGoal = async (req, res) => {
  try {
    const { title, targetAmount, months } = req.body;

    // Validation: Ensure we actually have a user ID from the middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, msg: "Unauthorized: No user ID found" });
    }
    
    // Calculate the Monthly "Reverse EMI"
    const installment = Math.ceil(targetAmount / months);
    
    const newGoal = new Goal({
      user: req.user.id, // 🔥 Strictly link to the logged-in user
      title,
      target: targetAmount, // Matching the field names from your Atlas screenshot
      installment,
      months,
      current: 0,
      createdAt: new Date()
    });

    await newGoal.save();
    res.status(201).json({ success: true, goal: newGoal });
  } catch (error) {
    console.error("GOAL_CREATE_ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};