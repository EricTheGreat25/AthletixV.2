import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const {data: user, error: userError} = await supabase
      .from("users")
      .select("*")
      .eq("user_id", id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "Account Does not exist" });
    }

    // Fetch avatar from user_details
    const {data: userDetails, error: detailsError} = await supabase
      .from("user_details")
      .select("avatar_url")
      .eq("user_id", id)
      .single();

    const {data: events, error: eventsError} = await supabase
      .from("events")
      .select("*")
      .eq("organizer_id", id);

    if (eventsError) {
      return res.status(500).json({ error: "Failed to fetch events" });
    }

    res.json({
      ...user,
      avatar_url: userDetails?.avatar_url || null,
      events: events || []
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router;