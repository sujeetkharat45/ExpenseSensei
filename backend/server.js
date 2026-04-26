require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google AI with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const Transaction = require('./models/Transaction'); //
const protect = require('./middleware/authMiddleware'); //
const Goal = require("./models/Goal");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Import
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err.message));

// Health Check Route
app.get("/", (req, res) => {
  res.send("🚀 ExpenseSensei API Running...");
});

// AI Chatbot Route
app.post("/api/chat", protect, async (req, res) => {
  try {
    const { message } = req.body;

    // Fetch context
    const recentTransactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(10);

    const context = recentTransactions.map(t => 
      `${t.date.toDateString()}: ${t.type} of ₹${t.amount} for ${t.category}`
    ).join("\n");

    // 🔥 THE FIX: Use the fully qualified model name for the v1 API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are ExpenseSensei, a finance bot. Context: ${context}. Question: ${message}`;

    // 🔥 Use the stable generation method
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ success: true, reply: text });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ reply: "Connection lost with AI server." });
  }
});


// 🔥 Get Active Goal
app.get("/api/goals", protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user._id });
    if (!goal) return res.json({ success: true, goal: null });
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching goal" });
  }
});
app.post("/api/goals", protect, async (req, res) => {
  try {
    const { title, target, installment, months } = req.body;
    // This updates the goal if it exists, or creates it if it doesn't
    const goal = await Goal.findOneAndUpdate(
      { user: req.user._id },
      { title, target, installment, months, current: 0 },
      { upsert: true, new: true }
    );
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving goal" });
  }
});


// Server Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});