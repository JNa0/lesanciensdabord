
const chemin = require("path")
const Mongoose = require("mongoose")
const PROTOCOLE = "mongodb"
const IDENTIFIANT = "admin"
const MOT_DE_PASSE = "exampleteeth.albumin.unbodied.exude"
const HÔTE = "mongo"
const PORT = "27017"
const BASE_DE_DONNÉES = "lesanciensdabord"
const ADRESSE = `${PROTOCOLE}://${IDENTIFIANT}:${MOT_DE_PASSE}@${HÔTE}:${PORT}/${BASE_DE_DONNÉES}`

const chargerModules = require("../../../../chargerModules.js")

Mongoose.createConnection(ADRESSE, {
	"useNewUrlParser": true,
	"useUnifiedTopology": true,
}, erreur => {
	throw erreur
	process.exit()
})

const CLIENT = Mongoose.connection

CLIENT.on("error", erreur => {
	throw erreur
	process.exit()
})

CLIENT.on("connected", () => {
	console.log("Connexion établie !")
})

function déconnecter () {
	Mongoose.disconnect()
}

process.on("exit", déconnecter)
process.on("SIGINT", déconnecter)
process.on("SIGTERM", déconnecter)
// SIGUSR1 et SIGUSR2 pour nodemon
process.on("uncaughtException", déconnecter)

module.exports = {
	"test": function (requête, réponse) {
		CLIENT.on("connected", function () {
			//schémas = chargerModules(chemin.join(__dirname, "_schémas/"))

			//const résultat = schémas.membre.find({ "nom": "De Rostand" })

			réponse.write("etat: " + Mongoose.STATES[CLIENT.readyState])

			résultat.exec((erreur, membres) => {
				réponse.write("Ici:\n")

				if (erreur)
					throw erreur

				if (membres.length > 0) {
					réponse.write(membres.length + " membres inscrits !\n")
					membres.forEach(membre => réponse.write(membre.prénom + " " + membre.nom + "\n"))
				}

				else
					réponse.write("nul membre\n")
			})
		})
	}
}
