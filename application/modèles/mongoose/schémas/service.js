
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("service", new Schema({
	"id_service": ObjectId,
	"id_organisation": ObjectId,
	"intitulé_service": String,
	"ville_service": String,
	"CP_service": String,
	"pays_service": String,
})
