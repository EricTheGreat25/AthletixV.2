import express from "express";
import { supabase } from "../supabaseClient.js"; 

const router = express.Router();

router.post("/", async (req, res) => {
  const { reviewer_id, reviewee_id, rating, comment } = req.body;

  if (!reviewer_id || !reviewee_id || !rating) {
    return res.status(400).json({ error: "Missing required fields (reviewer, reviewee, or rating)." });
  }

  if (reviewer_id === reviewee_id) {
    return res.status(400).json({ error: "You cannot review yourself." });
  }

  try {
    const { data: newReview, error: insertError } = await supabase
      .from("user_review")
      .insert([
        { 
          reviewer_id, 
          reviewee_id, 
          rating, 
          comment 
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("fullname")
      .eq("user_id", reviewer_id)
      .single();

    if (userError) {
      console.warn("Could not fetch reviewer name:", userError.message);
    }

    const responsePayload = {
      ...newReview,
      reviewer_name: userData ? userData.fullname : "Anonymous", 
    };

    res.status(201).json(responsePayload);

  } catch (err) {
    console.error("Add Review Error:", err.message);
    res.status(500).json({ message: "Internal Server Error", details: err.message });
  }
});

export default router;