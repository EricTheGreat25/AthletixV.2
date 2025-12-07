import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

//routes fetching all athletes
router.get("/", async (req, res) => {
  try {
    const { data: users, error: userError } = await supabase
      .from("users")
      .select(`
        user_id,
        fullname,
        sport_id,
        sport_name,
        birthdate,
        gender,
        bio,
        registration_date,
        role,
        location,
        verification_status
      `)
      .eq("role", "athlete");

    if (userError) throw userError;
    if (!users) return res.json([]);

    const { data: details, error: detailsError } = await supabase
      .from("user_details")
      .select("*");

    if (detailsError) throw detailsError;

    // Fetch stats for all athletes (optional table "athlete_stats")
    const { data: statsRows, error: statsError } = await supabase
      .from("athlete_stats")
      .select("user_id, ppg, rpg, apg");

    if (statsError && statsError.code !== "PGRST116") throw statsError;

    const statsByUser = new Map();
    (statsRows || []).forEach((row) => {
      statsByUser.set(row.user_id, row);
    });

    const athletes = users.map(user => {
      const detail = details.find(d => d.user_id === user.user_id);
      const statRow = statsByUser.get(user.user_id);
      const ppg = statRow?.ppg ?? 0;
      const rpg = statRow?.rpg ?? 0;
      const apg = statRow?.apg ?? 0;
      const age = user.birthdate
        ? new Date().getFullYear() - new Date(user.birthdate).getFullYear()
        : null;

      return {
        id: user.user_id,
        name: user.fullname,
        sport: user.sport_name || "",
        position: detail?.position || "",
        age,
        gender: user.gender || "",
        location: user.location || "",
        height: detail?.height_cm ?? null,
        weight: detail?.weight_kg ?? null,
        achievements: 0,
        stats: [
          { label: "PPG", value: ppg.toString() },
          { label: "RPG", value: rpg.toString() },
          { label: "APG", value: apg.toString() },
        ],
        verification_status: user.verification_status,
        imageUrl: detail?.avatar_url ?? null, // Add this line
      };
    });

    res.json(athletes);
  } catch (err) {
    console.error("Error fetching athletes:", err);
    res.status(500).json({ error: "Failed to load athletes" });
  }
});

//route fetching single athlete by id (for profile page)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        user_id,
        fullname,
        sport_name,
        birthdate,
        gender,
        bio,
        role,
        location,
        verification_status
      `)
      .eq("user_id", id)
      .eq("role", "athlete")
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    const { data: detail, error: detailsError } = await supabase
      .from("user_details")
      .select("height_cm, weight_kg, position, jersey_number, video_url, contact_num, email, avatar_url")
      .eq("user_id", id)
      .single();

    if (detailsError && detailsError.code !== "PGRST116") {
      console.error("Details error:", detailsError);
    }

    const { data: achievements, error: achError } = await supabase
      .from("achievements")
      .select("achievement_id, title, year, description")
      .eq("user_id", id)
      .order("created_at", { ascending: true });

    if (achError) {
      console.error("Achievements error:", achError);
    }

    const { data: education, error: eduError } = await supabase
      .from("education")
      .select("school, degree, field, end_year")
      .eq("user_id", id)
      .order("end_year", { ascending: false });

    if (eduError) {
      console.error("Education error:", eduError);
    }

    const { data: statsRow, error: statsError } = await supabase
      .from("athlete_stats")
      .select("ppg, rpg, apg")
      .eq("user_id", id)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Stats error:", statsError);
    }

    const ppg = statsRow?.ppg ?? 0;
    const rpg = statsRow?.rpg ?? 0;
    const apg = statsRow?.apg ?? 0;
   
    const age = user.birthdate
      ? new Date().getFullYear() - new Date(user.birthdate).getFullYear()
      : "N/A";

    const athlete = {
      id: user.user_id,
      name: user.fullname,
      sport: user.sport_name || "N/A",
      position: detail?.position || "N/A",
      age,
      gender: user.gender || "N/A",
      location: user.location || "N/A",
      bio: user.bio || "",
      verification_status: user.verification_status,
      height: detail?.height_cm ?? null,
      weight: detail?.weight_kg ?? null,
      jerseyNumber: detail?.jersey_number ?? null,
      email: detail?.email ?? null,
      imageUrl: detail?.avatar_url ?? null, 
      contactNum: detail?.contact_num ?? null,
      videos: detail?.video_url ? [{ url: detail.video_url }] : [],
      achievements: achievements || [],
      education: education?.map((e) => ({
        school: e.school,
        degree: e.degree,
        field: e.field,
        year: e.end_year ? e.end_year.toString() : null,
      })) || [],
      stats: {
        overall: [
          { label: "PPG", value: ppg, max: 50 },
          { label: "RPG", value: rpg, max: 20 },
          { label: "APG", value: apg, max: 20 },
        ],
      },
    };

    res.json(athlete);
  } catch (err) {
    console.error("Error fetching athlete:", err);
    res.status(500).json({ error: "Failed to load athlete" });
  }
});
  
export default router;
