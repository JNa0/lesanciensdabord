
const { rendre, } = require("./outils")

module.exports = {
	"index": async function (requête, réponse, fonctionSuivante) {
		réponse.redirect(requête.session.estConnecté ? `/membre/${requête.session.membre.nomUtilisateur}` : "/connexion")
	},

	"remerciements": async function (requête, réponse, fonctionSuivante) {
		rendre(requête, réponse, "remerciements")
	},
}
