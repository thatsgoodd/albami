const fs = require("fs");
const path = require("path");

const getFile = (filePath, res) => {
    fs.readFile(filePath, (errors, data) => {
        if (errors) {
            console.log("Error reading file...", errors);
            res.status(404).send("<h1>File not found</h1>");
        } else {
            res.status(200).send(data);
        }
    });
};

module.exports = {
    getFile
};