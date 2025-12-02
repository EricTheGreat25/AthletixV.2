import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Upsert athlete stats (admin-only should be enforced via auth in production)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { ppg, rpg, apg } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Athlete ID is required." });
  }

  try {
    const { data, error } = await supabase
      .from("athlete_stats")
      .upsert(
        {
          user_id: id,
          ppg: ppg ?? 0,
          rpg: rpg ?? 0,
          apg: apg ?? 0,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting athlete stats:", error.message);
      return res
        .status(500)
        .json({ message: "Failed to save stats.", error: error.message });
    }

    return res.status(200).json({
      message: "Stats updated successfully.",
      stats: data,
    });
  } catch (err) {
    console.error("Server error updating athlete stats:", err);
    return res
      .status(500)
      .json({ message: "Unexpected server error while updating stats." });
  }
});

export default router;


