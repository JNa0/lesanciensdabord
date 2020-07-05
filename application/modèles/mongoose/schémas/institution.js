
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("institution", new Schema({
	"id_institution": ObjectId,
	"intitulé": String,
})
