const axios = require("axios");

const getCoordinates = async (location, country) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: `${location}, ${country}`,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "wanderlust-app",
        },
      }
    );

    if (response.data.length > 0) {
      return {
        type: "Point",
        coordinates: [
          parseFloat(response.data[0].lon),
          parseFloat(response.data[0].lat),
        ],
      };
    }

    return {
      type: "Point",
      coordinates: [73.8567, 18.5204],
    };
  } catch (err) {
    console.log(err);

    return {
      type: "Point",
      coordinates: [73.8567, 18.5204],
    };
  }
};

module.exports = getCoordinates;