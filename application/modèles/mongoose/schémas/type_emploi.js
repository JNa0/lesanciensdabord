
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = Mongoose.model("type_emploi", new Schema({
	"id_type_emploi": ObjectId,
	"intitulé_type_emploi": String,
})
