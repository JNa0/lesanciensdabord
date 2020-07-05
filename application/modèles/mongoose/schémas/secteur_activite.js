
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("secteur_activite", new Schema({
	"id_secteur_activité": ObjectId,
	"intitulé_secteur": String,
})
