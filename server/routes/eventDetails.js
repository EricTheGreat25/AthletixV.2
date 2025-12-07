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

    // Fetch categories
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

    // Fetch sponsors
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

    // Fetch participant count
    const { count: participantCount } = await supabase
      .from("event_participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id);

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
      participantCount: participantCount || 0,
    });
  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete event (organizer only)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { organizerId } = req.body;

  try {
    // Verify the organizer owns the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("event_id", id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.organizer_id !== organizerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete the event (CASCADE will handle participants, mappings)
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("event_id", id);

    if (deleteError) throw deleteError;

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;