import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();

  if (!q) return res.json([]);

  // Users
  const { data: users, error: userErr } = await supabase
    .from("users")
    .select("user_id, fullname, sport_name, role")
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

  // News
  const { data: news, error: newsErr } = await supabase
    .from("newsPublished")
    .select("news_id, title, author_name, category, publish_date")
    .or(`title.ilike.%${q}%,content.ilike.%${q}%,category.ilike.%${q}%,author_name.ilike.%${q}%`)
    .limit(5);

  if (newsErr) console.error(newsErr);

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

  if (news) {
    news.forEach(n => results.push({
      type: "news",
      id: n.news_id,
      title: n.title,
      author: n.author_name,
      category: n.category,
      date: n.publish_date,
    }));
  }

  res.json(results);
});

export default router;
