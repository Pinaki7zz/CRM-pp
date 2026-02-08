// D:\Galvinus\CRM\CRM-main\Backend-Ser\app.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// Route Imports
const ticketRoutes = require("./routes/ticket.routes");
const ticketCategoriesRoutes = require("./routes/ticketCategories.routes");
const emailRoutes = require("./routes/email.routes");
const templateRoutes = require("./routes/template.routes");
const agentSupportRoutes = require("./routes/agentSupport.routes");

dotenv.config(); // Load environment variables

const app = express();
const prisma = new PrismaClient();

// --- CORS CONFIGURATION ---
const allowedOrigins = [
	"http://localhost:4010", // Your current Frontend port
	"http://localhost:5173", // Default Vite port
	"http://localhost:3000",
	"http://localhost:4006", // Activity Service
	...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : [])
];

app.use(cors({
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
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

// --- API ROUTES ---

// 1. Ticket Routes (Standard CRUD)
// Base: /ser/api/tickets
app.use("/ser/api/tickets", ticketRoutes);
app.use("/ser/api/ticket-categories",ticketCategoriesRoutes);

// 2. Email Routes (Connectivity & Sending)
// Base: /ser/api
// Note: The email.routes.js file already contains "/tickets/:id/emails", 
// so mounting at "/ser/api" creates the correct full path: "/ser/api/tickets/:id/emails"
app.use("/ser/api", emailRoutes);

// 3. Template Routes
app.use("/ser/api/templates", templateRoutes);

// 4. Agent Support Routes
app.use("/ser/api/agent-support", agentSupportRoutes);


// --- SYSTEM ROUTES ---

// Health check
app.get('/ser', (req, res) => {
	res.status(200).json({ message: '✅ Ticket Service is up and running!' });
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Internal Server Error' });
});

// Handle Prisma Disconnection on Process Exit
process.on('SIGINT', async () => {
	await prisma.$disconnect();
	process.exit(0);
});

// Start the Server
const PORT = process.env.PORT || 4007;
app.listen(PORT, () => {
	console.log(`Service Management Server is running on port ${PORT}`);
});
