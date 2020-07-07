
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId

module.exports = Mongoose.model("role", new Schéma({
	"id_rôle": ObjectId,
	"intitulé_rôle": String,
}, { "collection": "role" }))
