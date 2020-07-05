
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

/*
	Si l’année de sortie est indéfinie, la formation est encore en cours.

    Clé secondaire : { membre, formation } car le membre peut faire plusieurs formations mais ne peut faire la même formation plusieurs fois, ce qu’une clé contenant l’établissement permettrait (et ce bien que le diagramme signifie que c’est possible).
*/

module.exports = Mongoose.model("inscription", new Schema({
	"id_inscription": ObjectId,
	"membre": ObjectId,
	"établissement": ObjectId,
	"formation": ObjectId,
	"année_entrée": Date,
	"année_sortie": Date,
})
