const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  let allListings = await Listing.find();
  res.render("./listings/index.ejs", { allListings });
};

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    req.flash("error", "Please enter something to search!");
    return res.redirect("/listings");
  }

  const searchRegex = new RegExp(q.trim(), "i");

  const allListings = await Listing.find({
    $or: [
      { title: searchRegex },
      { location: searchRegex },
      { country: searchRegex },
    ],
  });

  if (allListings.length === 0) {
    req.flash("error", `No listings found for "${q}"`);
    return res.redirect("/listings");
  }

  req.flash("success", `Search results for "${q}"`);

  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  newListing.image = { filename, url };

  // Static coordinates (Pune)
  newListing.geometry = {
    type: "Point",
    coordinates: [73.8567, 18.5204],
  };

  await newListing.save();

  req.flash("success", "New listing created!");

  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash(
      "error",
      "Listing you trying to edit for does not exist!"
    );

    return res.redirect("/listings");
  }

  let imageUrl = listing.image.url;

  imageUrl = imageUrl.replace("/upload", "/upload/w_250,h_160");

  res.render("listings/edit.ejs", { listing, imageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  req.body.listing.geometry = {
    type: "Point",
    coordinates: [73.8567, 18.5204],
  };

  let updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;

    updatedListing.image = { url, filename };

    await updatedListing.save();
  }

  req.flash("success", "Listing updated!");

  res.redirect(`/listings/${id}`);
};

module.exports.filter = async (req, res) => {
  let { id } = req.params;

  let allListings = await Listing.find({
    category: { $all: [id] },
  });

  if (allListings.length != 0) {
    res.locals.success = `Listings Filtered by ${id}!`;

    res.render("listings/index.ejs", { allListings });
  } else {
    req.flash("error", `There is no any Listing for ${id}!`);

    res.redirect("/listings");
  }
};

module.exports.search = async (req, res) => {
  let input = req.query.q.trim().replace(/\s+/g, " ");

  if (input == "" || input == " ") {
    req.flash("error", "Please enter search query!");

    return res.redirect("/listings");
  }

  let data = input.split("");

  let element = "";

  let flag = false;

  for (let index = 0; index < data.length; index++) {
    if (index == 0 || flag) {
      element = element + data[index].toUpperCase();
    } else {
      element = element + data[index].toLowerCase();
    }

    flag = data[index] == " ";
  }

  let allListings = await Listing.find({
    title: { $regex: element, $options: "i" },
  });

  if (allListings.length != 0) {
    res.locals.success = "Listings searched by Title!";

    return res.render("listings/index.ejs", { allListings });
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      category: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });

    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Category!";

      return res.render("listings/index.ejs", { allListings });
    }
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      country: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });

    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Country!";

      return res.render("listings/index.ejs", { allListings });
    }
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      location: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });

    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Location!";

      return res.render("listings/index.ejs", { allListings });
    }
  }

  const intValue = parseInt(element, 10);

  const intDec = Number.isInteger(intValue);

  if (allListings.length == 0 && intDec) {
    allListings = await Listing.find({
      price: { $lte: element },
    }).sort({
      price: 1,
    });

    if (allListings.length != 0) {
      res.locals.success = `Listings searched by price less than Rs ${element}!`;

      return res.render("listings/index.ejs", { allListings });
    }
  }

  if (allListings.length == 0) {
    req.flash("error", "No listings found based on your search!");

    res.redirect("/listings");
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;

  let deletedListing = await Listing.findByIdAndDelete(id);

  console.log(deletedListing);

  req.flash("success", "Listing deleted!");

  res.redirect("/listings");
};

module.exports.reserveListing = async (req, res) => {
  let { id } = req.params;

  req.flash("success", "Reservation Details sent to your Email!");

 res.redirect(`/listings/${id}`);
};