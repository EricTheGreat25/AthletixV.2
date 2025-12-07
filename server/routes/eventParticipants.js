import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Join an event
router.post("/:eventId/join", async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    // Verify event exists
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("event_id")
      .eq("event_id", eventId)
      .single();

    if (eventError) throw eventError;

    // Check if already joined
    const { data: existing } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      return res.status(400).json({ message: "Already joined this event" });
    }

    // Add participant
    const { error: insertError } = await supabase
      .from("event_participants")
      .insert({ event_id: eventId, user_id: userId });

    if (insertError) throw insertError;

    res.json({ message: "Successfully joined the event!" });
  } catch (err) {
    console.error("Error joining event:", err);
    res.status(500).json({ error: "Failed to join event" });
  }
});

// Leave an event
router.delete("/:eventId/leave", async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    const { error } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ message: "Successfully left the event" });
  } catch (err) {
    console.error("Error leaving event:", err);
    res.status(500).json({ error: "Failed to leave event" });
  }
});

// Get participants for an event
// Get participants for an event
router.get("/:eventId/participants", async (req, res) => {
  const { eventId } = req.params;

  try {
    const { data: participants, error } = await supabase
      .from("event_participants")
      .select(`
        user_id,
        joined_at,
        users (
          user_id,
          fullname,
          sport_name,
          location,
          birthdate,
          gender
        )
      `)
      .eq("event_id", eventId);

    if (error) throw error;

    const formatted = participants.map((p, index) => ({
      participantNo: index + 1,
      userId: p.user_id,
      name: p.users.fullname,
      sport: p.users.sport_name,
      location: p.users.location,
      gender: p.users.gender,
      birthdate: p.users.birthdate,
      age: p.users.birthdate
        ? new Date().getFullYear() - new Date(p.users.birthdate).getFullYear()
        : "N/A",
      joinedAt: p.joined_at,
    }));

    res.json({ participants: formatted });
  } catch (err) {
    console.error("Error fetching participants:", err);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// Get participant count
router.get("/:eventId/count", async (req, res) => {
  const { eventId } = req.params;

  try {
    const { count, error } = await supabase
      .from("event_participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    if (error) throw error;

    res.json({ count: count || 0 });
  } catch (err) {
    console.error("Error getting participant count:", err);
    res.status(500).json({ error: "Failed to get count" });
  }
});

// Check if user joined event
router.get("/:eventId/check/:userId", async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    const { data, error } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    res.json({ hasJoined: !!data });
  } catch (err) {
    console.error("Error checking participation:", err);
    res.status(500).json({ error: "Failed to check participation" });
  }
});

export default router;