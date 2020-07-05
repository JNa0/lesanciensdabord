
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("formation", new Schema({
	"id_formation": ObjectId,
	"intitulé_court_formation": String,
	"intitulé_long_formation": String,
})
