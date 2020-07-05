
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("offre", new Schema({
	"id_offre" : ObjectId,
	"id_organisation" : ObjectId,
	"intitulé_offre" : String,
	"id_type_emploi" : ObjectId,
	"ville_offre" : String,
	"CP_offre" : String,
	"pays_offre" : String,
	"fichier_offre" : String,
	"date_dépôt" : Date,
	"durée_validité" : {
		"début": Date,
		"fin": Date,
	},
})
