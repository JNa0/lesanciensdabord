
const Mongoose = require("mongoose")
const PROTOCOLE = "mongodb"
const IDENTIFIANT = "admin"
const MOT_DE_PASSE = "exampleteeth.albumin.unbodied.exude"
const HÔTE = "mongo"
const PORT = "27017"
const BASE_DE_DONNÉES = "lesanciensdabord"
const ADRESSE = `${PROTOCOLE}://${IDENTIFIANT}:${MOT_DE_PASSE}@${HÔTE}/${BASE_DE_DONNÉES}`

const chargerModules = require("../../../../chargerModules.js")

module.exports = {
	"exécuter": async function (fonction) {
		await Mongoose.connect(ADRESSE, {
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

			return fonction({
				"client": CLIENT,
				schémas
			})
		}

		catch (erreur) {
			throw erreur
			process.exit()
		}

		finally {
			await CLIENT.close()
		}
	},
}
