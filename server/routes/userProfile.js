import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "Account does not exist" });
    }

    // Fetch avatar
    const { data: userDetails, error: detailsError } = await supabase
      .from("user_details")
      .select("avatar_url")
      .eq("user_id", id)
      .single();

    // Fetch events organized by the user WITH organizer name
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(fullname)
      `)
      .eq("organizer_id", id);

    if (eventsError) {
      return res.status(500).json({ error: "Failed to fetch events" });
    }

    // Map events to include organizer_name
    const eventsWithOrganizerName = events.map(event => ({
      ...event,
      organizer_name: event.organizer?.fullname || "Unknown Organizer"
    }));

    // Fetch user's achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", id);

    if (achievementsError) {
      return res.status(500).json({ error: "Failed to fetch achievements" });
    }

    res.json({
      ...user,
      avatar_url: userDetails?.avatar_url || null,
      events: eventsWithOrganizerName || [],
      achievements: achievements || []
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router;
