
const clientMongo = (function () {
	let accèsBDD

	require("mongodb").MongoClient.connect("lesanciensdabord")
	.then(client => {
		accèsBDD = client
	})
	.catch(erreur => {
		if (erreur)
			throw erreur
	})

	return accèsBDD.db("lesanciensdabord") || null
})

module.exports = {
	"creer": function (requête, réponse) {
		//const membresBDD = clientMongo.collection("membres")

		Object.keys(requête.params).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.query).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		réponse.write(requête.body)

		/*
		membres.insertOne({
			"nom": requête.params.nom,
			"prénom": requête.params.prénom,
			"dateNaissance": requête.params.dateNaissance,
		})
		.then(() => {
			réponse.write("\nSuccès d’insertion\n")
		})
		.catch(erreur => {
			throw erreur
		})
		*/

		réponse.send("\ntout va bien")
	},

	"modifier": function () {
		réponse.send("\ntout va bien")
	},

	"supprimer": function () {
		réponse.send("\ntout va bien")
	},
}
