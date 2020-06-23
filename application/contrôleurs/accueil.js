
module.exports = {
	"index": function (requête, réponse) {
		réponse.render("accueil", {
			"titre": "Accueil",
		})
	},
}
