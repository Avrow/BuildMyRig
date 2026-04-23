import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Add routes
import authRoute from "./routes/auth.route.js";
import componentRoute from "./routes/component.route.js";
import newsRouter from "./routes/news.route.js";
import postRouter from "./routes/post.route.js";
import productRouter from "./routes/product.route.js";
import reviewRouter from "./routes/review.route.js";
import shopRoute from "./routes/shop.route.js";
import pricewatcherRoute from "./routes/pricewatcher.route.js";
import inventoryalertRoute from "./routes/inventoryalert.route.js";



const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], 
    credentials: true,
}));
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

app.use("/api/posts", postRouter);

// todo: new
app.use("/api/news", newsRouter);

app.use("/api", productRouter);

// todo: new
app.use("/api/reviews", reviewRouter);
// Add shop routes
app.use("/api/shops", shopRoute);
// TODO: add user route
app.use("/api/pricewatcher", pricewatcherRoute);
app.use("/api/inventoryalert", inventoryalertRoute);

app.use((error, req, res, next) => {
	console.error("[server-error]", error);
	res.status(500).json({ error: "Something went wrong" });
});

// Fallback route for undefined endpoints
app.use((req, res) => {
	res.status(404).json({ error: "This route does not exist" });
});

export default app;
