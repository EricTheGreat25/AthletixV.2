import express from "express";
import { supabase } from "../supabaseClient.js"; 

const router = express.Router();

// -------------------- Verify User --------------------
router.put("/verify/:id", async (req, res) => {
  const userId = req.params.id;
  const { status } = req.body; 

  try {
    const { data, error } = await supabase
      .from("users")
      .update({ verification_status: status || "verified" }) 
      .eq("user_id", userId)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "User verification updated", data });
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ error: err.message || "Failed to verify user" });
  }
});

// -------------------- Delete User --------------------
router.delete("/delete/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Auth Delete Error:", authError);
      throw new Error("Failed to delete user from auth");
    }

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ error: err.message || "Failed to delete user" });
  }
});


// -------------------- Reset Password (Magic Link) --------------------
router.post("/reset-password/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data: authUser, error: authFetchError } = await supabase.auth.admin.getUserById(userId);
    
    if (authFetchError || !authUser?.user?.email) {
      return res.status(404).json({ error: "User email not found" });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      authUser.user.email,
      {
        redirectTo: `${process.env.FRONTEND_URL || "http://localhost:8080"}/reset-password`,
      }
    );

    if (error) throw error;

    res.json({ message: "Password reset link sent to user email" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: err.message || "Failed to send reset email" });
  }
});

export default router;