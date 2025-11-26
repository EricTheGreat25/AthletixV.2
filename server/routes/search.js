import express from "express";
import { supabase } from "../supabaseClient.js";


const router = express.Router();

router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();

  if (!q) return res.json([]);

  // Users
  const { data: users, error: userErr } = await supabase
    .from("users")
    .select("user_id, fullname, sport_name")
    .or(`fullname.ilike.%${q}%,sport_name.ilike.%${q}%`)
    .limit(5);

  if (userErr) console.error(userErr);

  // Events
  const { data: events, error: eventErr } = await supabase
    .from("events")
    .select("event_id, title, sport_name, start_datetime")
    .or(`title.ilike.%${q}%,sport_name.ilike.%${q}%`)
    .limit(5);

  if (eventErr) console.error(eventErr);

  const results = [];

  if (users) {
    users.forEach(u => results.push({
      type: "user",
      id: u.user_id,
      name: u.fullname,
      sport: u.sport_name,
      role: u.role,
    }));
  }

  if (events) {
    events.forEach(e => results.push({
      type: "event",
      id: e.event_id,
      name: e.title,
      sport: e.sport_name,
      date: e.start_datetime,
    }));
  }

  res.json(results);
});

export default router;
