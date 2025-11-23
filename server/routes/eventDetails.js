import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the event by ID
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Fetch organizer user info
    const { data: user } = await supabase
      .from("users")
      .select("fullname")
      .eq("user_id", event.organizer_id)
      .single();

    // Fetch organizer contact info
    const { data: details } = await supabase
      .from("user_details")
      .select("email, contact_num")
      .eq("user_id", event.organizer_id)
      .single();

    // Return combined event and organizer info
    res.json({
      ...event,
      date: event.start_datetime ? new Date(event.start_datetime) : null,
      endDate: event.end_datetime ? new Date(event.end_datetime) : null,
      organizer_name: user?.fullname || "Organizer Name",
      organizer_email: details?.email || "email@example.com",
      organizer_phone: details?.contact_num || "123-456-7890",
    });
  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
