const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  registerUser,
  verifyRegisterOtp,
  loginUser,
  verifyOtp,
  updateLimit,
  deleteAccount
} = require("../controllers/authController");

// Public routes
router.post("/register", registerUser);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

// Protected routes
router.put("/limit", auth, updateLimit);
router.delete("/delete-account", auth, deleteAccount);

module.exports = router;