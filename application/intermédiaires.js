
module.exports = [
	function (requête, réponse, fonctionSuivante) {
		réponse.setHeader("charset", "utf-8")
		fonctionSuivante()
	},
	// Express a pour défaut de ne gérer pas le décodage des URLs et de refuser impertinnement de lier des routes UTF-8 à des URL reçues encodées (%xx%xx)…
	/*
	function convertirURLUTF8 (requête, réponse, fonctionSuivante) {
		requête.url = decodeURIComponent(requête.url)
		// Cette approche pose des risques de sécurité et de fiabilité sur certains points :
			// Ne convertir pas la section /chemin en bloc à cause des confusions en % encodés et % encodants, entre ? encodés et ? marquant le début de la partie ?get mais le faire par /partie
			// Ne convertir pas la section ?get en bloc mais par champ/valeur une fois qu’elle est analysée pour éviter les problèmes avec & encodés et & séparateurs et + encodés et + espaçants
		fonctionSuivante()
	},
	*/
]
