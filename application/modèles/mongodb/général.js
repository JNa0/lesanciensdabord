
const ClientMongo = require("mongodb").MongoClient
const PROTOCOLE = "mongodb"
const IDENTIFIANT = "admin"
const MOT_DE_PASSE = "exampleteeth.albumin.unbodied.exude"
const HÔTE = "mongo"
const ADRESSE = `${PROTOCOLE}://${IDENTIFIANT}:${MOT_DE_PASSE}@${HÔTE}`

module.exports = {
	exécuter: async function (fonction) {
		try {
			let client = new ClientMongo(ADRESSE, {
				"useNewUrlParser": true,
				"useUnifiedTopology": true
			})

			await client.connect()

			fonction.bind(this, [ client ])
		}

		catch (erreur) {
			throw erreur
			process.exit()
		}

		finally {
			await client.close()
		}
	},
}
