import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        user_id,
        fullname,
        sport_name,
        role,
        registration_date,
        verification_status
      `);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Failed to fetch users." });
    }

    const mapped = data.map((u) => ({
      id: u.user_id,
      name: u.fullname,
      sport: u.sport_name,
      role: u.role,
      registrationDate: u.registration_date,
      verificationStatus: u.verification_status,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error fetching users." });
  }
});

export default router;
