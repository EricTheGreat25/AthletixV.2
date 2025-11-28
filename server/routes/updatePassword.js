import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    if (!email || !currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    // verify current password
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

    if (signInError || !signInData?.user)
      return res.status(401).json({ message: "Current password is incorrect" });

    // update password (Supabase sends email automatically if enabled)
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;

    res.status(200).json({
      message: "Password updated. Supabase email notification sent automatically.",
    });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

export default router;
