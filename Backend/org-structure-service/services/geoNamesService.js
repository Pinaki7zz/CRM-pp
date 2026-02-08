const axios = require("axios");

const getPostalData = async (postalCode, countryCode, username) => {
  try {
    const response = await axios.get(
      "http://api.geonames.org/postalCodeSearchJSON",
      {
        params: {
          postalcode: postalCode,
          country: countryCode,
          maxRows: 10,
          username: username,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("GeoNames API error: " + error.message);
  }
};

module.exports = {
  getPostalData,
};
