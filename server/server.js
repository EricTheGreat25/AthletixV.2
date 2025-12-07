import express from "express";
import cors from "cors";
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
import getUsers from "./routes/getUsers.js";
import userAction from "./routes/userAction.js";

const app = express();

app.use(cors());
app.use(express.json());

//Routes
app.use("/register", registerRouter);
app.use("/logout", logoutRouter);
app.use("/login", LoginRouter);
app.use("/create-events", eventCreationRouter);
app.use("/sports", sportsRouter);
app.use("/get-events", getEventsRouter);
app.use("/api/athletes", athletesRouter);
app.use("/api/event-participants", eventParticipantsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/update-password", updatePasswordRoute);
app.use("/forgot-password", forgotPasswordRouter);
app.use("/api/events", eventsRouter);
app.use("/api/organizers", userProfileRouter);
app.use("/api/search", searchRouter);
app.use("/api/athlete-stats", athleteStatsRouter);
app.use("/api/edit-event", editEvent);
app.use("/api/news-drafts", newsRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/get-users", getUsers);
app.use("/api/user-action", userAction);

//server port
app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
