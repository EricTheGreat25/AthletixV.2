import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// -------------------- GET CATEGORIES --------------------
router.get("/categories", async (req, res) => {
  try {
    const { data, error } = await supabase.from("event_categories").select("*");
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json([]);
  }
});

// -------------------- GET SPONSORS --------------------
router.get("/sponsors", async (req, res) => {
  try {
    const { data, error } = await supabase.from("sponsors").select("*");
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Error fetching sponsors:", err);
    res.status(500).json([]);
  }
});

// -------------------- GET EVENT DETAILS WITH RELATIONS --------------------
router.get("/:id/details", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch main event data
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", id)
      .single();

    if (eventError) throw eventError;
    if (!eventData) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Fetch categories with full details
    const { data: categoryMappings } = await supabase
      .from("event_category_mapping")
      .select(
        `
        category_id,
        event_categories (
          category_id,
          name
        )
      `
      )
      .eq("event_id", id);

    // Fetch sponsors with full details
    const { data: sponsorMappings } = await supabase
      .from("event_sponsor_mapping")
      .select(
        `
        sponsor_id,
        sponsors (
          sponsor_id,
          name
        )
      `
      )
      .eq("event_id", id);

    const categories = (categoryMappings || [])
      .map((m) => m.event_categories)
      .filter(Boolean);

    const sponsors = (sponsorMappings || [])
      .map((m) => m.sponsors)
      .filter(Boolean);

    return res.status(200).json({
      ...eventData,
      categories,
      sponsors,
    });
  } catch (err) {
    console.error("Error fetching event details:", err);
    return res.status(500).json({
      message: "Failed to fetch event details.",
      error: err.message,
    });
  }
});

// -------------------- UPDATE EVENT --------------------
// Simple update endpoint for basic event fields
router.put("/:id/simple", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    organizer,
    type,
    sport,
    start_datetime,
    end_datetime,
    participants,
    status,
    description,
  } = req.body;

  try {
    console.log("=== UPDATE EVENT REQUEST ===");
    console.log("Event ID:", id);
    console.log("Request body:", req.body);

    const updateData = {};
    if (title !== undefined && title !== null) updateData.title = title;
    if (type !== undefined && type !== null) updateData.type = type;
    if (sport !== undefined && sport !== null) updateData.sport_name = sport;
    if (start_datetime !== undefined && start_datetime !== null)
      updateData.start_datetime = start_datetime;
    if (end_datetime !== undefined && end_datetime !== null)
      updateData.end_datetime = end_datetime;
    if (participants !== undefined && participants !== null)
      updateData.participants = parseInt(participants) || 0;
    if (status !== undefined && status !== null) updateData.status = status;
    if (description !== undefined && description !== null)
      updateData.description = description;

    console.log("Fields to update:", updateData);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid fields to update",
        received: req.body,
      });
    }

    console.log("Calling Supabase with:", {
      table: "events",
      filter: `event_id=${id}`,
      updateData,
    });

    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .update(updateData)
      .eq("event_id", id)
      .select()
      .single();

    console.log("Supabase response:", { eventData, eventError });

    if (eventError) {
      console.error("Supabase error details:", eventError);
      return res.status(500).json({
        message: "Failed to update event in database",
        error: eventError.message,
        details: eventError,
      });
    }

    if (!eventData) {
      console.warn("No event found with ID:", id);
      return res.status(404).json({ message: "Event not found." });
    }

    console.log("Update successful:", eventData);

    return res.status(200).json({
      message: "Event updated successfully.",
      event: eventData,
    });
  } catch (err) {
    console.error("=== UNEXPECTED ERROR ===", err);
    return res.status(500).json({
      message: "Failed to update event.",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// -------------------- UPDATE EVENT (COMPLEX) --------------------
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  let {
    category_ids = [],
    new_categories = [],
    sponsor_ids = [],
    new_sponsors = [],
    ...eventFields
  } = req.body;

  try {
    // -------------------- UPDATE MAIN EVENT --------------------
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .update(eventFields)
      .eq("event_id", id)
      .select()
      .single();

    if (eventError) throw eventError;
    if (!eventData) {
      return res.status(404).json({ message: "Event not found." });
    }

    // -------------------- HANDLE CATEGORIES --------------------
    const finalCategoryIds = [...category_ids]; // Start with existing IDs

    // Insert new categories and collect their IDs
    for (let catName of new_categories) {
      const { data: newCat, error: insertError } = await supabase
        .from("event_categories")
        .insert({ name: catName })
        .select()
        .single();

      if (insertError) throw insertError;
      if (newCat) finalCategoryIds.push(newCat.category_id);
    }

    // Remove old category mappings
    await supabase.from("event_category_mapping").delete().eq("event_id", id);

    // Insert new category mappings
    if (finalCategoryIds.length > 0) {
      const categoryRows = finalCategoryIds.map((catId) => ({
        event_id: id,
        category_id: catId,
      }));
      await supabase.from("event_category_mapping").insert(categoryRows);
    }

    // -------------------- HANDLE SPONSORS --------------------
    const finalSponsorIds = [...sponsor_ids]; // Start with existing IDs

    // Insert new sponsors and collect their IDs
    for (let sponsorName of new_sponsors) {
      const { data: newSponsor, error: sponsorError } = await supabase
        .from("sponsors")
        .insert({ name: sponsorName })
        .select()
        .single();

      if (sponsorError) throw sponsorError;
      if (newSponsor) finalSponsorIds.push(newSponsor.sponsor_id);
    }

    // Remove old sponsor mappings
    await supabase.from("event_sponsor_mapping").delete().eq("event_id", id);

    // Insert new sponsor mappings
    if (finalSponsorIds.length > 0) {
      const sponsorRows = finalSponsorIds.map((sponsorId) => ({
        event_id: id,
        sponsor_id: sponsorId,
      }));
      await supabase.from("event_sponsor_mapping").insert(sponsorRows);
    }

    // -------------------- FETCH UPDATED CATEGORIES --------------------
    const { data: updatedCategoryMappings } = await supabase
      .from("event_category_mapping")
      .select(
        `
        category_id,
        event_categories (
          category_id,
          name
        )
      `
      )
      .eq("event_id", id);

    // -------------------- FETCH UPDATED SPONSORS --------------------
    const { data: updatedSponsorMappings } = await supabase
      .from("event_sponsor_mapping")
      .select(
        `
        sponsor_id,
        sponsors (
          sponsor_id,
          name
        )
      `
      )
      .eq("event_id", id);

    // Format the response properly
    const categories = (updatedCategoryMappings || [])
      .map((m) => m.event_categories?.name)
      .filter(Boolean);

    const sponsors = (updatedSponsorMappings || [])
      .map((m) => m.sponsors?.name)
      .filter(Boolean);

    return res.status(200).json({
      message: "Event updated successfully.",
      event: {
        ...eventData,
        categories,
        sponsors,
      },
    });
  } catch (err) {
    console.error("Error updating event:", err);
    return res.status(500).json({
      message: "Failed to update event.",
      error: err.message,
    });
  }
});

export default router;
