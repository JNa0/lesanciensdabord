
const général = require("./général.js")

module.exports = {
	"lister": function () {
		return général.exécuter(function (CLIENT_MONGO) {
			return CLIENT_MONGO
				.db("lesanciensdabord")
				.collection("membre")
				.find()
				.sort({ prénom: 1 })
				.toArray()
		})
	},
	"créer": function () {
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

		return
	},
	/*
	"modifier": function () {
		return
	},
	*/
}
