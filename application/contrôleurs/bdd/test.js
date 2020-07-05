
const Mongoose = require("mongoose")
const PROTOCOLE = "mongodb"
const IDENTIFIANT = "admin"
const MOT_DE_PASSE = "exampleteeth.albumin.unbodied.exude"
const HÔTE = "mongo"
const PORT = "27017"
const BASE_DE_DONNÉES = "lesanciensdabord"
const ADRESSE = `${PROTOCOLE}://${IDENTIFIANT}:${MOT_DE_PASSE}@${HÔTE}/${BASE_DE_DONNÉES}`

const chargerModules = require("../../../../chargerModules.js")
const BMongoose = chargerModules("../../modèles/mongoose")

module.exports = {
	"test": function (requête, réponse) {
		Mongoose.connect(ADRESSE, {
			"useNewUrlParser": true,
			"useUnifiedTopology": true,
		})

		const CLIENT = Mongoose.connection

		try {
			CLIENT.on("error", erreur => {
				throw erreur
				process.exit()
			})

			const schémas = chargerModules("./schémas")

			const membres = CLIENT.once("open", function (CLIENT_MONGO) {
				return CLIENT_MONGO
					.collection("membre")
					.find()
					.sort({ prénom: 1 })
					.toArray()
			})

			membres.forEach(membre => réponse.write(membre.prénom + " " + membre.nom))

			réponse.end()
		}

		catch (erreur) {
			throw erreur
			process.exit()
		}

		finally {
			CLIENT.close()
		}
	},
}
