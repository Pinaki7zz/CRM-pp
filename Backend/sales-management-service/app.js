const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const productRoutes = require("./routes/productRoutes");
const productCategoryRoutes = require("./routes/productCategoryRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const salesQuoteRoutes = require("./routes/salesQuoteRoutes");
const salesOrderRoutes = require("./routes/salesOrderRoutes");

dotenv.config(); // Load environment variables

const app = express();
const prisma = new PrismaClient();

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
app.use(express.json());	// ✅ Parse JSON request bodies

// Mount separate routes
app.use("/sm/api/product", productRoutes);
app.use("/sm/api/product-category", productCategoryRoutes);
app.use("/sm/api/opportunity", opportunityRoutes);
app.use("/sm/api/sales-quote", salesQuoteRoutes);
app.use("/sm/api/sales-order", salesOrderRoutes);

// Handle Prisma Disconnection on Process Exit
process.on('SIGINT', async () => {
	await prisma.$disconnect();
	process.exit(0);
});

// Start the Server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
