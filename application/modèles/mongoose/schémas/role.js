
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("role", new Schema({
	"id_rôle": ObjectId,
	"intitulé_rôle": String,
})
