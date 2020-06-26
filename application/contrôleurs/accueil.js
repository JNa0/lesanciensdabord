
module.exports = {
	"index": function (requête, réponse) {
		réponse.render("accueil", {
			"langue": réponse.fr,
			"titre": "Accueil",
		})
	},
}
