
const ClientMongo = require("mongodb").MongoClient
const PROTOCOLE = "mongodb"
const IDENTIFIANT = "admin"
const MOT_DE_PASSE = "exampleteeth.albumin.unbodied.exude"
const HÔTE = "mongo"
const PORT = "27017"
const ADRESSE = `${PROTOCOLE}://${IDENTIFIANT}:${MOT_DE_PASSE}@${HÔTE}` //:${PORT}

module.exports = {
	"exécuter": function (fonction) {
		const client = new ClientMongo(ADRESSE, {
			"useNewUrlParser": true,
			"useUnifiedTopology": true,
		})

		try {
			client.connect()

			return fonction.bind(null, [ client ])
		}

		catch (erreur) {
			throw erreur
			process.exit()
		}

		finally {
			client.close()
		}
	},
}
