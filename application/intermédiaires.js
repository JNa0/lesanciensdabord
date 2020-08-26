
module.exports = [
	// Prépare la réponse au format UTF‐8
	function (requête, réponse, fonctionSuivante) {
		réponse.setHeader("charset", "utf-8")
		fonctionSuivante()
	},

	// Initialise les droits de session au statut de “visiteur”
	function (requête, réponse, fonctionSuivante) {
		if (requête.session.estConnecté === undefined)
			requête.session.estConnecté = false

		if (requête.session.droits === undefined)
			requête.session.droits = global.droits.visiteur

		fonctionSuivante()
	},
]
