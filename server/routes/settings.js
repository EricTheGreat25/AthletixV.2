// server/routes/settings.js
import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("✅ Settings route works!");
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("📡 Received request for userId:", userId);
  const token = req.headers.authorization?.split(" ")[1];
 
  
  try {
    if (!token) return res.status(401).json({ error: "Missing auth token" });

    // Verify token
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) return res.status(401).json({ error: authError.message });
    if (!authUser || authUser.id !== userId)
      return res.status(403).json({ error: "Forbidden" });

      // Fetch from `users`
      const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id, fullname, location, birthdate, bio")
      .eq("user_id", userId)
      .maybeSingle();

      if (!userData) {
        return res.status(404).json({ error: "User record not found" });
      }


  // Fetch from `user_details` (with new socials)
    const { data: detailsData, error: detailsError } = await supabase
    .from("user_details")
    .select("email, contact_num, height_cm, weight_kg, position, jersey_number, video_url, avatar_url")
    .eq("user_id", userId)
    .single();

  
    if (detailsError && detailsError.code !== "PGRST116") throw detailsError;

    // Merge
    const userCombined = {
    ...userData,
    ...(detailsData || {}),
    };

    // Fetch achievements
    const { data: achievements, error: achError } = await supabase
      .from("achievements")
      .select("achievement_id, title, year, description")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (achError) throw achError;

    // Fetch education
    const { data: education, error: eduError } = await supabase
      .from("education")
      .select("education_id, school, degree, field, start_year, end_year")
      .eq("user_id", userId)
      .order("start_year", { ascending: true });
    if (eduError) throw eduError;

    res.json({
      user: userCombined,
      achievements: achievements || [],
      education: education || [],
    });
  } catch (err) {
    console.error("GET /settings error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});


router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) return res.status(401).json({ error: "Missing auth token" });

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError) return res.status(401).json({ error: authError.message });
    if (!authUser || authUser.id !== userId)
      return res.status(403).json({ error: "Forbidden" });

    const {
      user: userPayload,
      achievements = [],
      education = [],
      deletedAchievementIds = [],
      deletedEducationIds = [],
    } = req.body;

    /* ---- Update `users` table ---- */
    const usersUpdate = {
      fullname: userPayload.fullname ?? undefined,
      birthdate: userPayload.birthdate ?? undefined,
      gender: userPayload.gender ?? undefined,
      location: userPayload.location ?? undefined,
      bio: userPayload.bio ?? undefined,
      updated_at: new Date().toISOString(),
    };
    Object.keys(usersUpdate).forEach(
      (key) => usersUpdate[key] === undefined && delete usersUpdate[key]
    );

    const { error: usersError } = await supabase
      .from("users")
      .update(usersUpdate)
      .eq("user_id", userId);
    if (usersError) throw usersError;

    /* ---- Update or Insert `user_details` ---- */
    const detailsUpdate = {
      height_cm:
        userPayload.height === "" || userPayload.height == null
          ? null
          : parseInt(userPayload.height, 10),
      weight_kg:
        userPayload.weight === "" || userPayload.weight == null
          ? null
          : parseInt(userPayload.weight, 10),
      position: userPayload.position ?? null,
      jersey_number: userPayload.jersey_number ?? null,
      contact_num: userPayload.phone ?? userPayload.contact_num ?? null,
      email: userPayload.email ?? null,
      video_url: userPayload.video_url ?? null,
    };

    // Only update avatar_url if it's provided in the payload
    if (userPayload.avatar_url !== undefined) {
      detailsUpdate.avatar_url = userPayload.avatar_url;
    }

    const { data: existingDetails } = await supabase
      .from("user_details")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingDetails) {
      const { error: updateDetailsError } = await supabase
        .from("user_details")
        .update(detailsUpdate)
        .eq("user_id", userId);
      if (updateDetailsError) throw updateDetailsError;
    } else {
      const insertPayload = { user_id: userId, ...detailsUpdate };
      const { error: insertDetailsError } = await supabase
        .from("user_details")
        .insert(insertPayload);
      if (insertDetailsError) throw insertDetailsError;
    }

    /* ---- Delete marked achievements ---- */
    if (deletedAchievementIds.length > 0) {
      const { error: delAchError } = await supabase
        .from("achievements")
        .delete()
        .in("achievement_id", deletedAchievementIds)
        .eq("user_id", userId);
      if (delAchError) throw delAchError;
    }

    /* ---- Upsert achievements ---- */
    for (const ach of achievements) {
      const yearVal =
        ach.year === "" || ach.year == null ? null : parseInt(ach.year, 10);
      if (ach.achievement_id) {
        const { error: updateAchError } = await supabase
          .from("achievements")
          .update({
            title: ach.title,
            year: yearVal,
            description: ach.description,
            updated_at: new Date().toISOString(),
          })
          .eq("achievement_id", ach.achievement_id)
          .eq("user_id", userId);
        if (updateAchError) throw updateAchError;
      } else {
        const insertAch = {
          user_id: userId,
          title: ach.title,
          year: yearVal,
          description: ach.description,
        };
        const { error: insertAchError } = await supabase
          .from("achievements")
          .insert(insertAch);
        if (insertAchError) throw insertAchError;
      }
    }

    /* ---- Delete marked education ---- */
    if (deletedEducationIds.length > 0) {
      const { error: delEduError } = await supabase
        .from("education")
        .delete()
        .in("education_id", deletedEducationIds)
        .eq("user_id", userId);
      if (delEduError) throw delEduError;
    }

    /* ---- Upsert education ---- */
    for (const edu of education) {
      const startVal =
        edu.startYear === "" || edu.startYear == null
          ? null
          : parseInt(edu.startYear, 10);
      const endVal =
        edu.endYear === "" || edu.endYear == null
          ? null
          : parseInt(edu.endYear, 10);
      if (edu.education_id) {
        const { error: updateEduError } = await supabase
          .from("education")
          .update({
            school: edu.school,
            degree: edu.degree,
            field: edu.field,
            start_year: startVal,
            end_year: endVal,
            updated_at: new Date().toISOString(),
          })
          .eq("education_id", edu.education_id)
          .eq("user_id", userId);
        if (updateEduError) throw updateEduError;
      } else {
        const insertEdu = {
          user_id: userId,
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          start_year: startVal,
          end_year: endVal,
        };
        const { error: insertEduError } = await supabase
          .from("education")
          .insert(insertEdu);
        if (insertEduError) throw insertEduError;
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /settings error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
