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

    // Fetch categories with full details
    const { data: categoryMappings } = await supabase
      .from("event_category_mapping")
      .select(`
        category_id,
        event_categories (
          category_id,
          name
        )
      `)
      .eq("event_id", id);

    // Fetch sponsors with full details
    const { data: sponsorMappings } = await supabase
      .from("event_sponsor_mapping")
      .select(`
        sponsor_id,
        sponsors (
          sponsor_id,
          name
        )
      `)
      .eq("event_id", id);

    // Extract category and sponsor names
    const categories = (categoryMappings || [])
      .map(m => m.event_categories?.name)
      .filter(Boolean);

    const sponsors = (sponsorMappings || [])
      .map(m => m.sponsors?.name)
      .filter(Boolean);

    // Return combined event and organizer info
    res.json({
      ...event,
      date: event.start_datetime ? new Date(event.start_datetime) : null,
      endDate: event.end_datetime ? new Date(event.end_datetime) : null,
      organizer_name: user?.fullname || "Organizer Name",
      organizer_email: details?.email || "email@example.com",
      organizer_phone: details?.contact_num || "123-456-7890",
      categories,
      sponsors,
    });
  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;