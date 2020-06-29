
const clientMongo = (function () {
	let accèsBDD

	require("mongodb").MongoClient.connect("lesanciensdabord", (erreur, client) => {
		if (erreur)
			throw erreur

		else {
			accèsBDD = client
		}
	})

	return accèsBDD
})

module.exports = {
	"creer": function (requête, réponse) {
		réponse.render("tout va bien")
	},

	"modifier": function () {
		réponse.render("tout va bien")
	},

	"supprimer": function () {
		réponse.render("tout va bien")
	},
}
