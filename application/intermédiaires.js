
module.exports = [
	function définirUTF8 (requête, réponse, fonctionSuivante) {
		réponse.setHeader("charset", "utf-8")
		fonctionSuivante()
	},
	function convertirURL (requête, réponse, fonctionSuivante) {
		// Risques de sécurité et de fiabilité sur certains points :
			// Ne convertir pas la section /chemin en bloc à cause des confusions en % encodés et pour % encodants, entre ? encodés et ? marquant le début de la partie ?get mais le faire par /partie
			// Ne convertir pas la section ?get en bloc mais par champ/valeur une fois qu’elle est analysée pour éviter les problèmes avec & encodés et & séparateurs et + encodés et + espaçants
		//console.log(requête.url)
		//requête.url = decodeURIComponent(requête.url)
		//console.log(requête.url)
		fonctionSuivante()
	},
]
