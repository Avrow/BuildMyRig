import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./db/connect.js";

import { startRestockChecker } from "./service/restockChecker.js";

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
    await connectDB();
    startRestockChecker();
    console.log(`✅ Server is running on port ${PORT}`);
});
