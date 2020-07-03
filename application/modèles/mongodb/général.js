
const ClientMongo = require("mongodb").MongoClient
const PROTOCOLE = "mongodb"
const IDENTIFIANT = "admin"
const MOT_DE_PASSE = "exampleteeth.albumin.unbodied.exude"
const HÔTE = "mongo"
const PORT = "27017"
const ADRESSE = `${PROTOCOLE}://${IDENTIFIANT}:${MOT_DE_PASSE}@${HÔTE}` //:${PORT}

module.exports = {
	"exécuter": async function (fonction) {
		let client = new ClientMongo(ADRESSE, {
			"useNewUrlParser": true,
			"useUnifiedTopology": true,
		})

		try {
			await client.connect()

			return await client
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
