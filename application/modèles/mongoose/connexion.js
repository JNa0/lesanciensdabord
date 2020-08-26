
const chemin = require("path")
const Mongoose = require("mongoose")

const PROTOCOLE = "mongodb"
const IDENTIFIANT = "admin"
const MOT_DE_PASSE = "exampleteeth.albumin.unbodied.exude"
const HÔTE = "mongo"
const PORT = "27017"
const BASE_DE_DONNÉES = "lesanciensdabord"
const ADRESSE = `${PROTOCOLE}://${IDENTIFIANT}:${MOT_DE_PASSE}@${HÔTE}:${PORT}` // /${BASE_DE_DONNÉES}`

Mongoose.connect(ADRESSE, {
	"useNewUrlParser": true,
	"useFindAndModify": false,
	"useCreateIndex": true,
	"useUnifiedTopology": true,
	"dbName": "lesanciensdabord",
	"autoIndex": false,
})

const client = Mongoose.connection

client.on("error", erreur => {
	throw erreur
	process.exit()
})

client.on("connected", () => {
	console.log("Connexion établie !")
})

// En cas d’exception du serveur, ferme la connexion à la base de données
const déconnecter = () => {
	console.log("Déconnexion de MongoDB…")

	Mongoose.disconnect()
}

process.on("exit", déconnecter)
process.on("SIGINT", déconnecter)
process.on("SIGTERM", déconnecter)

module.exports = client
