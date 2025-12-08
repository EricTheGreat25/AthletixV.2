import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, password, role, gender, birthDate, region, sport } = req.body;

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:8080/login",
        data: { name, role },
      },
    });

    if (authError) {
      if (authError.message.includes("User already registered") || authError.status === 422) {
        return res.status(409).json({ message: "This email is already associated with an account." });
      }
      throw new Error(authError.message);
    }

    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        return res.status(409).json({ message: "This email is already associated with an account." });
    }

    // 4. Fetch Sport Name
    const { data: sportData, error: sportError } = await supabase
      .from("sports")
      .select("sport_name")
      .eq("sport_id", parseInt(sport, 10))
      .single();

    if (sportError) throw new Error("Failed to fetch sport name");

    const sportName = sportData?.sport_name || "";

    // 5. Insert into Public Users Table
    const { error: userError } = await supabase.from("users").insert({
      user_id: authData.user?.id,
      fullname: name,
      role,
      gender,
      birthdate: birthDate,
      location: region,
      sport_id: parseInt(sport, 10),
      sport_name: sportName,
      bio: req.body.bio,
      registration_date: new Date().toISOString(),
    });

    if (userError) {
      if (userError.code === '23505') {
        return res.status(409).json({ message: "This email is already associated with an account." });
      }
      
      throw new Error(userError.message);
    }

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
    });

  } catch (error) {
    console.error("Registration Error:", error.message);
    
    // Final safety net catch
    if (error.message.includes("User already registered") || error.message.includes("unique constraint")) {
        return res.status(409).json({ message: "This email is already associated with an account." });
    }

    res.status(400).json({ message: error.message });
  }
});

export default router;