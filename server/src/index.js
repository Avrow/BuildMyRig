import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./db/connect.js";


const PORT = 8000; 

if (!process.env.NEWSAPI_KEY?.trim()) {
	console.error(
		"[Startup] NEWSAPI_KEY is missing. News endpoints will fail until this is configured.",
	);
}

app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`✅ Server is running on port ${PORT}`);
        console.log(`🔗 Frontend should fetch from: http://localhost:${PORT}/api/posts`);
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
});