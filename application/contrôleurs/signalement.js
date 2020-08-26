
const { afficherInscription, inscrire, } = require("./outils")

module.exports = {
	"afficherInscription": async function (requête, réponse, fonctionSuivante) {
		afficherInscription(requête, réponse, {
			"vue": "inscription/signalement",
			fonctionSuivante,
		})
	},

	"inscrire": async function (requête, réponse, fonctionSuivante) {
		inscrire(requête, réponse, {
			"type": "signalement",
			fonctionSuivante,
		})
	},
}
