const mongoose = require("mongoose");

const projectschema = mongoose.Schema({
    title : String,
    description : String,
    image : String,
    createdat : {
        type: Date,
        default : Date.now
    }
});

module.exports = mongoose.model("project", projectschema);

