
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("domaine", new Schema({
	"id_domaine": ObjectId,
	"intitulé_domaine": String,
})
