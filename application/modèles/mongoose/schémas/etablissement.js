
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("etablissement", new Schema({
	"id_établissement": ObjectId,
	"nom": String,
	"ville": String,
	"CP_établissement": String,
	"pays": String,
	"id_institution": ObjectId,
})
