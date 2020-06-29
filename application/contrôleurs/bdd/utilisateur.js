
const clientMongo = (function () {
	let accèsBDD

	require("mongodb").MongoClient.connect("mongodb://lesanciensdabord-mdbx.infolannion.com")
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
	"test": function (requête, réponse) {
		const membresBDD = clientMongo.collection("membres")
		réponse.send()
	},

	"creer": function (requête, réponse) {
		Object.keys(requête.params).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.query).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.body).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

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
