
const générerErreur = require("http-errors")

const { rendre, afficherAnnuaire, } = require("./outils")
const droits = require("./droits")

module.exports = {
	"index": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "annuaire"))
			rendre(requête, réponse, "annuaire/index", { fonctionSuivante, })

		else
			réponse.redirect(`/connexion?vers=${requête._parsedUrl.pathname}`)
	},

	"listerMembres": async function (requête, réponse, fonctionSuivante) {
		afficherAnnuaire(requête, réponse, {
			"type": "membre",
			fonctionSuivante,
		})
	},

	"listerOrganisations": async function (requête, réponse, fonctionSuivante) {
		afficherAnnuaire(requête, réponse, {
			"type": "organisation",
			fonctionSuivante,
		})
	},
}
