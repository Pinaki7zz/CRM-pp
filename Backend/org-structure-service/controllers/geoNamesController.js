const geonamesService = require("../services/geoNamesService");

const fetchPostalInfo = async (req, res) => {
  const { postalCode, countryCode } = req.query;
  const username = process.env.GEONAMES_USERNAME; // Set this in your .env file

  if (!postalCode || !countryCode) {
    return res
      .status(400)
      .json({ error: "postalCode and countryCode are required" });
  }

  try {
    const data = await geonamesService.getPostalData(
      postalCode,
      countryCode,
      username
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  fetchPostalInfo,
};
