
const { afficherInscription, } = require("./outils")

module.exports = {
	"afficher": async function (requête, réponse, fonctionSuivante) {
		afficherInscription(requête, réponse, {
			"vue": "inscription/index",
			fonctionSuivante,
			"adresseRedirection": "/inscription/membre",
		})
	},
}
