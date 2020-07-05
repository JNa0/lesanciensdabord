
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("membre", new Schema({
	"id_membre": ObjectId,
	"est_validé": { "type": Boolean, "default": false },
	"nom_utilisateur": String,
	"mot_de_passe": String,
	"prénom": String,
	"nom_patronymique": String,
	"nom_marital": String,
	"civilité": Boolean,
	"date_naissance": Date,
	"photographie": String,
	"id_rôle": ObjectId,
	"CV": String,
	"lien_linkedin": String,
	"lien_viadeo": String,
	"lien_site_personnel": String,
	"adresse_mél": String,
	"numéro_téléphone": String,
	"poste_actuel": String,
	"service": ObjectId,
	"recherche_emploi": ObjectId,
	"durée_emploi": {
		"début": Date,
		"fin": Date,
	},
	"début_emploi": Date,
	"fin_emploi": Date,
	"autorisation_données_perso": Boolean,
	"autorisation_données_pro": Boolean,
})

// Les dates de début et de fin d’emploi correspondent à la période pour la quelle le membre cherche un emploi et non celles effectivement employées.
