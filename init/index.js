require("dotenv").config();

const mongoose = require("mongoose");
const axios = require("axios");

const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongoUrl = process.env.ATLASDB_URL;

main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoUrl);
}

const getCoordinates = async (location, country) => {
  try {
    const query = `${location}, ${country}`;

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
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

    // fallback
    return {
      type: "Point",
      coordinates: [73.8567, 18.5204],
    };
  } catch (err) {
    console.log("Geocoding Error:", err.message);

    return {
      type: "Point",
      coordinates: [73.8567, 18.5204],
    };
  }
};

const initDB = async () => {
  try {
    await Listing.deleteMany({});

    const updatedData = await Promise.all(
      initData.data.map(async (obj) => {
        const geometry = await getCoordinates(
          obj.location,
          obj.country
        );

        return {
          ...obj,
          owner: "66567b03fda820235197b582",
          geometry,
        };
      })
    );

    await Listing.insertMany(updatedData);

    console.log("DB is initialized");
  } catch (error) {
    console.error("Error initializing DB:", error);
  }
};

initDB();