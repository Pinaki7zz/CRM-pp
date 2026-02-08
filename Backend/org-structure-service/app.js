require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const businessEntityRoutes = require("./routes/businessEntityRoutes");
const businessUnitRoutes = require("./routes/businessUnitRoutes");
const salesChannelRoutes = require("./routes/salesChannelRoutes");
const salesOfficeRoutes = require("./routes/salesOfficeRoutes");
const salesTeamRoutes = require("./routes/salesTeamRoutes");
const salesTeamManagerRoutes = require("./routes/salesTeamManagerRoutes");
const salesTeamEmployeeRoutes = require("./routes/salesTeamEmployeeRoutes");
const marketingChannelRoutes = require("./routes/marketingChannelRoutes");
const marketingOfficeRoutes = require("./routes/marketingOfficeRoutes");
const marketingTeamRoutes = require("./routes/marketingTeamRoutes");
const marketingTeamManagerRoutes = require("./routes/marketingTeamManagerRoutes");
const marketingTeamEmployeeRoutes = require("./routes/marketingTeamEmployeeRoutes");
const serviceChannelRoutes = require("./routes/serviceChannelRoutes");
const serviceOfficeRoutes = require("./routes/serviceOfficeRoutes");
const serviceTeamRoutes = require("./routes/serviceTeamRoutes");
const serviceTeamManagerRoutes = require("./routes/serviceTeamManagerRoutes");
const serviceTeamEmployeeRoutes = require("./routes/serviceTeamEmployeeRoutes");
const geoNamesRoutes = require("./routes/geoNamesRoutes");

const prisma = new PrismaClient();
const app = express();

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

// Routes
app.use("/ms/api/business-entities", businessEntityRoutes);
app.use("/ms/api/business-units", businessUnitRoutes);
app.use("/ms/api/sales-channels", salesChannelRoutes);
app.use("/ms/api/sales-offices", salesOfficeRoutes);
app.use("/ms/api/sales-teams", salesTeamRoutes);
app.use("/ms/api/sales-team-managers", salesTeamManagerRoutes);
app.use("/ms/api/sales-team-employees", salesTeamEmployeeRoutes);
app.use("/ms/api/marketing-channels", marketingChannelRoutes);
app.use("/ms/api/marketing-offices", marketingOfficeRoutes);
app.use("/ms/api/marketing-teams", marketingTeamRoutes);
app.use("/ms/api/marketing-team-managers", marketingTeamManagerRoutes);
app.use("/ms/api/marketing-team-employees", marketingTeamEmployeeRoutes);
app.use("/ms/api/service-channels", serviceChannelRoutes);
app.use("/ms/api/service-offices", serviceOfficeRoutes);
app.use("/ms/api/service-teams", serviceTeamRoutes);
app.use("/ms/api/service-team-managers", serviceTeamManagerRoutes);
app.use("/ms/api/service-team-employees", serviceTeamEmployeeRoutes);
app.use("/ms/api/geonames", geoNamesRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = app;
