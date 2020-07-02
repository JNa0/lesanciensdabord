
module.exports = {
	"créer": function (requête, réponse) {
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
		*/

		Object.keys(requête.params).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.query).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.body).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		réponse.end()
	},

	"lister": async function (requête, réponse) {
			const CLIENT_MONGO = mongodb.connecter()

			const membres = await CLIENT_MONGO.db("lesanciensdabord").collection("membre").find().sort({ prénom: 1 }).toArray()

			if (membres.length > 0)
				membres.forEach(membre => réponse.write(membre.prénom + " " + membre.nom))

			else
				réponse.write("nul membre")

			réponse.end()

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
