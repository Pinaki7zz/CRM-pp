const express = require("express");
const router = express.Router();
const geonamesController = require("../controllers/geoNamesController");

router.get("/postalcode", geonamesController.fetchPostalInfo);

module.exports = router;
