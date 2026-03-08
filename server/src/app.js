import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Add routes
import authRoute from "./routes/auth.route.js";
import componentRoute from "./routes/component.route.js";
import shopRoute from "./routes/shop.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	}),
);

// Health check endpoint
app.get("/", (req, res) => {
	res.send("Hello from PC Builds API!");
});

app.get("/health-check", (req, res) => {
	res.status(200).json({ status: "OK" });
});

// done: add auth route
app.use("/api/auth", authRoute);
// done: add component vault route
app.use("/api/components", componentRoute);
// Add shop routes
app.use("/api/shops", shopRoute);
// TODO: add user route

// Fallback route for undefined endpoints
app.use("/", (req, res) => {
	res.status(404).json({ error: "This route does not exist" });
});

export default app;
