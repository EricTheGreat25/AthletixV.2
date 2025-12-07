// routes/follows.js
import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// -------------------- Follow a user --------------------
router.post("/follow", async (req, res) => {
  const { follower_id, following_id } = req.body;

  if (follower_id === following_id) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  const { error } = await supabase
    .from("follows")
    .insert([{ follower_id, following_id }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "User followed successfully" });
});

// -------------------- Unfollow a user --------------------
router.delete("/unfollow", async (req, res) => {
  const { follower_id, following_id } = req.body;

  const { error, count } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", follower_id)
    .eq("following_id", following_id);

  if (error) return res.status(400).json({ error: error.message });
  if (count === 0) return res.status(404).json({ error: "Follow relationship not found" });

  res.json({ message: "User unfollowed successfully" });
});

// -------------------- Check if a user is following another --------------------
router.get("/is-following", async (req, res) => {
  const { follower_id, following_id } = req.query;

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", follower_id)
    .eq("following_id", following_id)
    .single();

  if (error && error.code !== "PGRST116") return res.status(400).json({ error: error.message });

  res.json({ isFollowing: !!data });
});

// -------------------- Count followers --------------------
router.get("/:user_id/followers", async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("following_id", user_id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ count: data.length });
});

// -------------------- Count following --------------------
router.get("/:user_id/following", async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user_id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ count: data.length });
});

export default router;
