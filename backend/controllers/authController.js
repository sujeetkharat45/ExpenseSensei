const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Individual model imports to ensure they are correctly registered
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");

// 1. Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify mail server connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Mail Server Login Failed:", error.message);
  } else {
    console.log("✅ Mail Server is Ready to Send!");
  }
});

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, gender, mobile } = req.body;

    if (!name || !email || !password || !gender || !mobile) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      mobile
    });

    const savedUser = await newUser.save();

    // Welcome Email Logic
    const mailOptions = {
      from: `"ExpenseSensei" <${process.env.EMAIL_USER}>`,
      to: savedUser.email,
      subject: "Welcome to ExpenseSensei! ✨",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hello, ${savedUser.name}! 👋</h2>
          <p>Thank you for joining <b>ExpenseSensei</b>. Your account is now active!</p>
          <p>Start tracking your expenses and mastering your savings today.</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("Mail Error:", error);
      else console.log("Mail Sent: " + info.response);
    });

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      user: { id: savedUser._id, name, email, gender, mobile },
      token
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender, // 🔥 MUST INCLUDE THIS
        mobile: user.mobile,
      }
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateLimit = async (req, res) => {
  try {
    const { limit, income } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const today = new Date();
    const lastReset = user.lastResetDate ? new Date(user.lastResetDate) : new Date();
    const diffTime = Math.abs(today - lastReset);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      const remainingBudget = (user.limit || 0) - (user.currentMonthExpenses || 0);
      if (remainingBudget > 0) {
        user.savings = (user.savings || 0) + remainingBudget;
      }
      user.currentMonthExpenses = 0;
      user.income = 0;
      user.lastResetDate = today;
    }

    user.limit = Number(limit);
    if (income) user.income = Number(income);

    await user.save();

    res.json({
      success: true,
      limit: user.limit,
      income: user.income,
      savings: user.savings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 ACCOUNT DELETION LOGIC
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Delete all transactions belonging to this user
    await Transaction.deleteMany({ user: userId });

    // 2. Delete all goals belonging to this user
    await Goal.deleteMany({ user: userId });

    // 3. Optional Safeguard: Wipe goals with no user (orphans)
    // This removes that "Hero Xtreme" goal you saw in Atlas
    await Goal.deleteMany({ user: null });

    // 4. Finally delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({ success: true, msg: "Account and associated data purged successfully" });
  } catch (err) {
    console.error("DELETE_ACCOUNT_ERROR:", err);
    res.status(500).json({ success: false, msg: "Server error during deletion" });
  }
};