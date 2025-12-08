import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// REMOVED: const genAI = ... (Don't initialize here)

// POST /api/analytics
router.post("/analytics", async (req, res) => {
  try {
    const { athletes } = req.body;

    // 1. Debugging: Check if the key is actually loaded
    // (This will print to your terminal when you click the button)
    console.log("Using API Key:", process.env.GEMINI_API_KEY ? "Loaded" : "MISSING");

    if (!process.env.GEMINI_API_KEY) {
       return res.status(500).json({ error: "Server Error: API Key is missing." });
    }
    
    // 2. Initialize Gemini HERE, just before using it
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    if (!athletes || athletes.length === 0) {
      return res.status(400).json({ error: "No athlete data provided" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a professional sports scout. Compare the following athletes based on their provided stats and details.
      
      Athletes Data:
      ${JSON.stringify(athletes, null, 2)}

      Please provide a comparative analysis including:
      1. **Strengths & Weaknesses**: A brief breakdown for each athlete.
      2. **Direct Comparison**: Compare key stats (e.g., speed, strength, scoring) relevant to their sport/position.
      3. **Verdict**: Who is the better prospect and why?

      Format the response cleanly using Markdown (use bullet points and bold text).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ analysis: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
});

export default router;