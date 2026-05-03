import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Routes Import
import authRoute from "./routes/auth.route.js";
import componentRoute from "./routes/component.route.js";
import newsRouter from "./routes/news.route.js";
import postRouter from "./routes/post.route.js";
import productRouter from "./routes/product.route.js";
import reviewRouter from "./routes/review.route.js";
import shopRoute from "./routes/shop.route.js";
import marketplaceRoute from "./routes/marketplaceRoutes.js";
import aiBuildMatcherRoute from "./routes/ai-build-matcher.route.js";
import pricewatcherRoute from "./routes/pricewatcher.route.js";
import inventoryalertRoute from "./routes/inventoryalert.route.js";
import buildRoute from "./routes/build.route.js";
import aiReviewRoute from "./routes/ai-review.route.js";


import quoteRoute from "./routes/quoteRoutes.js";
import marketTrendRoute from "./routes/markettrend.route.js";


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:3001"],
		credentials: true,
	}),
);

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/components", componentRoute);
app.use("/api/posts", postRouter);
app.use("/api/ai-build-matcher", aiBuildMatcherRoute);

// *** মেইন ফিক্স: এই লাইনটা ঠিকঠাক আছে কি না দেখো ***
app.use("/api/marketplace", marketplaceRoute);

app.use("/api/news", newsRouter);
app.use("/api", productRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/shops", shopRoute);
// TODO: add user route
app.use("/api/pricewatcher", pricewatcherRoute);
app.use("/api/inventoryalert", inventoryalertRoute);
app.use("/api/builds", buildRoute);
app.use("/api/ai-build-matcher", aiBuildMatcherRoute);

app.use("/api/quotes", quoteRoute);
app.use("/api/markettrend", marketTrendRoute);
app.use("/api/ai-review", aiReviewRoute);

// Error handling middleware
app.use((error, req, res, next) => {
	console.error("[server-error]", error);
	res.status(500).json({ error: "Something went wrong" });
});

// Fallback route (এইটা সবার নিচে থাকতে হবে)
app.use((req, res) => {
	res.status(404).json({ error: "This route does not exist" });
});


export default app;
//