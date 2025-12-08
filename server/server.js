import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

import registerRouter from "./routes/register.js";
import logoutRouter from "./routes/logout.js";
import LoginRouter from "./routes/login.js";
import eventCreationRouter from "./routes/createEvent.js";
import sportsRouter from "./routes/sportsRouter.js";
import getEventsRouter from "./routes/getEvents.js";
import athletesRouter from "./routes/athletes.js";
import settingsRouter from "./routes/settings.js";
import updatePasswordRoute from "./routes/updatePassword.js";
import forgotPasswordRouter from "./routes/forgotPassword.js";
import eventsRouter from "./routes/eventDetails.js";
import eventParticipantsRouter from "./routes/eventParticipants.js";
import userProfileRouter from "./routes/userProfile.js";
import searchRouter from "./routes/search.js";
import athleteStatsRouter from "./routes/athleteStats.js";
import editEvent from "./routes/editEvent.js";
import newsRoutes from "./routes/newsRoutes.js";
import FollowsRouter from "./routes/follows.js";
import getUsers from "./routes/getUsers.js";
import userAction from "./routes/userAction.js";
import uploadStatsRouter from "./routes/uploadStats.js";
import { getStats } from "./routes/getStats.js"; 
import analyticsRouter from "./routes/analytics.js"; 
import allStats from "./routes/allstats.js";
import userReviewRoutes from "./routes/addReview.js";
import getReviewsRouter from "./routes/getReviews.js";
const app = express();

app.use(cors());
app.use(express.json());

//Routes
// User related
app.use("/register", registerRouter);
app.use("/login", LoginRouter);
app.use("/logout", logoutRouter);
app.use("/api/get-users", getUsers);
app.use("/api/user-action", userAction);
app.use("/api/reviews", userReviewRoutes); 
app.use("/api/reviews", getReviewsRouter);

// Athlete related
app.use("/api/athletes", athletesRouter);
app.use("/api/athlete-stats", athleteStatsRouter);
app.use("/api/upload-stats", uploadStatsRouter);
app.use("/api", analyticsRouter);

// Event related
app.use("/create-events", eventCreationRouter);
app.use("/api/events", eventsRouter);
app.use("/api/event-participants", eventParticipantsRouter);
app.use("/api/edit-event", editEvent);
app.use("/sports", sportsRouter);
app.use("/get-events", getEventsRouter);
// News
app.use("/api/news-drafts", newsRoutes);
app.use("/api/news", newsRoutes);

// Settings
app.use("/api/settings", settingsRouter);
app.use("/api/update-password", updatePasswordRoute);
app.use("/forgot-password", forgotPasswordRouter);

// Profile & follows
app.use("/api/organizers", userProfileRouter);
app.use("/api/follows", FollowsRouter);
app.use("/api/search", searchRouter);
// Stats retrieval
app.get("/api/get-stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
app.use("/api/allstats", allStats);

const PORT = process.env.PORT || 5000;
//server port
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
