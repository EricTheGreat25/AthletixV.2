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
app.use("/api/settings", settingsRouter);
app.use("/api/update-password", updatePasswordRoute);
app.use("/forgot-password", forgotPasswordRouter);

// Start server
app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
