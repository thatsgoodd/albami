const express = require("express");
const router = express.Router();
const path = require("path");
const contentTypes = require("./contentTypes");
const utils = require("./utils");

router.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "views", "index.html"));
});

router.post("/", (req, res) => {
    res.status(200).send("POSTED");
});


module.exports = router;