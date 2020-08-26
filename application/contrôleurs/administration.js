
const { rendre, afficherInscription, inscrire, routeParDéfaut, } = require("./outils")
const droits = require("./droits")

module.exports = {
	"accueil": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "administration"))
			rendre(requête, réponse, `administration/index`, { fonctionSuivante, }, {
				"comptesEnAttente": await requête.modèle.membre.lister({ "estValidé": false, }),
				"signalements": await requête.modèle.signalement.lister(),
				"compteMembres": await requête.modèle.membre.compter({ "estValidé": true, }),
				"compteOrganisations": await requête.modèle.organisation.compter(),
				"compteOffres": await requête.modèle.offre.compter(),
			})

		else
			réponse.redirect(`/connexion?vers=${requête._parsedUrl.pathname}`)
	},

	"validerMembre": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "administration")) {
			await requête.modèle.membre.valider(requête.body.compte)

			réponse.redirect("/administration")
		}

		else
			réponse.redirect(`/connexion?vers=${requête._parsedUrl.pathname}`)
	},

	"supprimerMembre": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "administration")) {
			await requête.modèle.membre.supprimer(requête.body.compte)

			réponse.redirect("/administration")
		}

		else
			réponse.redirect(`/connexion?vers=${requête._parsedUrl.pathname}`)
	},

	"supprimerSignalement": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "administration")) {
			await requête.modèle.signalement.supprimer(requête.body.signalement)

			réponse.redirect("/administration")
		}

		else
			réponse.redirect(`/connexion?vers=${requête._parsedUrl.pathname}`)
	},
}
