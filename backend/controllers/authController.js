const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) console.log("❌ Mail Server Login Failed:", error.message);
  else console.log("✅ Mail Server is Ready to Send!");
});

// ─── REGISTER (Step 1) ──────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, gender, mobile } = req.body;

    if (!name || !email || !password || !gender || !mobile)
      return res.status(400).json({ msg: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name, email, password: hashedPassword, gender, mobile,
      otp, otpExpiry
    });
    await newUser.save();
    console.log("✅ User saved with OTP:", otp);

    await transporter.sendMail({
      from: `"ExpenseSensei" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your ExpenseSensei Account 🔐",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hello, ${name}! 👋</h2>
          <p>Your OTP to verify your account is:</p>
          <h1 style="letter-spacing: 8px; color: #4F46E5;">${otp}</h1>
          <p>Valid for <b>5 minutes</b>. Do not share it with anyone.</p>
        </div>
      `
    });

    res.status(201).json({ success: true, msg: "OTP sent to your email" });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── VERIFY REGISTER OTP (Step 2) ───────────────────────────
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("📩 Received OTP:", otp, "| type:", typeof otp);

    const user = await User.findOne({ email });

    console.log("🗄️ Stored OTP:", user?.otp, "| type:", typeof user?.otp);
    console.log("⏰ OTP Expiry:", user?.otpExpiry, "| Now:", new Date());
    console.log("✅ Match?", user?.otp === otp);

    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ msg: "Invalid OTP" });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ msg: "OTP expired. Please register again." });

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    transporter.sendMail({
      from: `"ExpenseSensei" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to ExpenseSensei! ✨",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hello, ${user.name}! 👋</h2>
          <p>Your account is now verified and active!</p>
          <p>Start tracking your expenses and mastering your savings today.</p>
        </div>
      `
    }, (err, info) => {
      if (err) console.log("Mail Error:", err);
      else console.log("Welcome Mail Sent:", info.response);
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, gender: user.gender, mobile: user.mobile }
    });

  } catch (err) {
    console.log("VERIFY REGISTER OTP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── LOGIN (Step 1) ──────────────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    console.log("✅ Login OTP saved:", otp);

    await transporter.sendMail({
      from: `"ExpenseSensei" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your ExpenseSensei Login OTP 🔐",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hello, ${user.name}! 👋</h2>
          <p>Your One-Time Password (OTP) for login is:</p>
          <h1 style="letter-spacing: 8px; color: #4F46E5;">${otp}</h1>
          <p>This OTP is valid for <b>5 minutes</b>. Do not share it with anyone.</p>
        </div>
      `
    });

    res.json({ success: true, msg: "OTP sent to your email" });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── VERIFY LOGIN OTP (Step 2) ───────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("📩 Received OTP:", otp, "| type:", typeof otp);

    const user = await User.findOne({ email });

    console.log("🗄️ Stored OTP:", user?.otp, "| type:", typeof user?.otp);
    console.log("⏰ OTP Expiry:", user?.otpExpiry, "| Now:", new Date());
    console.log("✅ Match?", user?.otp === otp);

    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ msg: "Invalid OTP" });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ msg: "OTP expired. Please login again." });

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      msg: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, gender: user.gender, mobile: user.mobile }
    });

  } catch (err) {
    console.log("VERIFY OTP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ─── UPDATE LIMIT ────────────────────────────────────────────
exports.updateLimit = async (req, res) => {
  try {
    const { limit, income } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    const today = new Date();
    const lastReset = user.lastResetDate ? new Date(user.lastResetDate) : new Date();
    const diffDays = Math.ceil(Math.abs(today - lastReset) / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      const remainingBudget = (user.limit || 0) - (user.currentMonthExpenses || 0);
      if (remainingBudget > 0) user.savings = (user.savings || 0) + remainingBudget;
      user.currentMonthExpenses = 0;
      user.income = 0;
      user.lastResetDate = today;
    }

    user.limit = Number(limit);
    if (income) user.income = Number(income);
    await user.save();

    res.json({ success: true, limit: user.limit, income: user.income, savings: user.savings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── DELETE ACCOUNT ──────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await Transaction.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });
    await Goal.deleteMany({ user: null });

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ success: false, msg: "User not found" });

    res.json({ success: true, msg: "Account and associated data purged successfully" });
  } catch (err) {
    console.error("DELETE_ACCOUNT_ERROR:", err);
    res.status(500).json({ success: false, msg: "Server error during deletion" });
  }
};