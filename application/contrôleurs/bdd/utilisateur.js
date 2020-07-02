
module.exports = {
	/*
		.collection("membre")
		.insertOne({ "nom": "Gaillou", "prénom": "Roger", })

		membres.insertOne({
			"nom": requête.params.nom,
			"prénom": requête.params.prénom,
			"dateNaissance": requête.params.dateNaissance,
		})
		.then(() => {
			réponse.write("\nSuccès d’insertion\n")
		})

		Object.keys(requête.params).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.query).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.body).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		réponse.send("\ntout va bien")
	*/

	"lister": async function (requête, réponse) {
		const ClientMongo = require("mongodb").MongoClient
		const adresse = "mongodb://admin:exampleteeth.albumin.unbodied.exude@mongo"

		réponse.write("connection:<br>")

		try {
			const client = new ClientMongo(adresse, {
				"useNewUrlParser": true,
				"useUnifiedTopology": true
			})

			await client.connect()

			const membres = await client.db("lesanciensdabord").collection("membre").find().sort({ prénom: 1 }).toArray()

			if (membres.length > 0)
				membres.forEach(membre => réponse.write(membre.prénom + " " + membre.nom))

			else
				réponse.write("nul membre")

			réponse.end()
		}

		catch (erreur) {
			réponse.write(erreur.message)
			réponse.end()
			throw erreur
			process.exit()
		}

		finally {
			await client.close()
		}

		/*
			let membre = BDD
				.collection("membre")
				.find()

				réponse.write(${membres.length} membre(s) trouvé(s).<br/>)

			membres.forEach(membre => {
				réponse.write(JSON.stringify(membre) + "<br/>")
			})
		*/
	},
}
