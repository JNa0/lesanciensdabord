
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

// La clé est { id_membre, id_domaine }
module.exports = Mongoose.model("recherche", new Schema({
	"id_membre": ObjectId,
	"id_domaine": ObjectId,
})
