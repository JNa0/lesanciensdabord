
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("organisation", new Schema({
	"id_organisation": ObjectId,
	"nom_organisation": String,
	"raison_sociale": String,
	"logotype": String,
	"id_secteur_activité": ObjectId,
	"effectif": Number,
	"ville_siège_social": String,
	"CP_siège_social": String,
	"pays_siège_social": String,
	"lien_site": String,
})
