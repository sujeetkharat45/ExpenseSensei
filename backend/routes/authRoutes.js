const express = require("express");
const router = express.Router();

// 1. Import the auth middleware (default export)
const auth = require("../middleware/authMiddleware"); 

// 2. Import updateLimit from the controller
const { 
  registerUser, 
  loginUser, 
  updateLimit,
  deleteAccount
} = require("../controllers/authController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// 3. Protected route: Only logged-in users can update their budget
router.put("/limit", auth, updateLimit);
router.delete("/delete-account", auth, deleteAccount);
module.exports = router;