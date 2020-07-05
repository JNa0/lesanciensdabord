
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

// La clé est { id_offre, id_domaine }
module.exports = Mongoose.model("appartient_a", new Schema({
	// Référence une offre
	"id_offre": ObjectId,
	// Référence un domaine
	"id_domaine": ObjectId,
}))
