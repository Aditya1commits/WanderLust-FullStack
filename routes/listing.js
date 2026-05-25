const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middlewares.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const initData = require("../init/data.js");
const Listing = require("../models/listing.js");

const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.get(
  "/new",
  isLoggedIn,
  listingController.renderNewForm
);

router.get(
  "/filter/:id",
  wrapAsync(listingController.filter)
);

router.get(
  "/search",
  wrapAsync(listingController.searchListings)
);

router.get("/init", async (req, res) => {
  try {
    await Listing.deleteMany({});

    const sampleListings = initData.data.map((obj) => ({
      ...obj,

      owner: "66567b03fda820235197b582",

      geometry: {
        type: "Point",
        coordinates: [77.2090, 28.6139],
      },
    }));

    await Listing.insertMany(sampleListings);

    res.send("Database Initialized Successfully!");
  } catch (err) {
    console.log(err);
    res.send("Error Initializing Database");
  }
});

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

router.get(
  "/:id/reservelisting",
  isLoggedIn,
  wrapAsync(listingController.reserveListing)
);

module.exports = router;