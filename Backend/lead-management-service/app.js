// app.js
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express(); // <-- Initialize app first
const prisma = new PrismaClient();

const leadRoutes = require("./routes/leadRoutes");

const allowedOrigins = process.env.FRONTEND_URL
	? process.env.FRONTEND_URL.split(",")
	: [];

app.use(cors({
	origin: function (origin, callback) {
		// Allow server-to-server calls (Postman, curl, cron jobs)
		if (!origin) return callback(null, true);

		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		return callback(new Error(`CORS blocked for origin: ${origin}`), false);
	},
	credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("strict routing", false);
app.set("case sensitive routing", false);

// Fix: Use distinct base paths
app.use("/lm/api/leads", leadRoutes);

// Handle Prisma Disconnection on Process Exit
process.on("SIGINT", async () => {
	await prisma.$disconnect();
	process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT} `);
});
