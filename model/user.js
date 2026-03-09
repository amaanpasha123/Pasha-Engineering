const mongoose = require("mongoose");

const admin = mongoose.Schema({
    name: String,
    password : String
});

module.exports = mongoose.model("admin", adminSchema);
