import express from "express";
import { supabase } from "../supabaseClient.js"; 

const router = express.Router();

// 1. Whitelist allowed sports to prevent invalid table queries
const ALLOWED_SPORTS = ["basketball", "football", "volleyball", "soccer"];

async function getAllStats(userId, sport) {
  // Validate sport before making the DB call
  if (!ALLOWED_SPORTS.includes(sport)) {
    throw new Error(`Invalid sport: ${sport}`);
  }

  // Supabase table names: basketball_stats, football_stats, etc.
  const { data, error } = await supabase
    .from(`${sport}_stats`)
    .select("*")
    .eq("user_id", userId);
    // .single();  <-- REMOVED for flexibility (see notes below)

  if (error) throw error;
  return data;
}

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { sport } = req.query; // ?sport=basketball

  if (!sport) {
    return res.status(400).json({ error: "Sport parameter is required (e.g., ?sport=basketball)" });
  }

  try {
    const stats = await getAllStats(userId, sport);
    
    // Check if data exists (Supabase returns [] if no rows found when not using .single())
    if (!stats || stats.length === 0) {
      return res.status(404).json({ error: "No stats found for this user in this sport." });
    }

    // Return the data (returns an array of games or a single object depending on your DB)
    res.json(stats);

  } catch (err) {
    console.error("Stats Error:", err.message);
    
    if (err.message.includes("Invalid sport")) {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;