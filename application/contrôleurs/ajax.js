
const droits = require("./droits")

module.exports = {
	"organisations": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "AJAX")) {
			try {
				const filtres = {}

				if (requête.params.recherche)
					filtres.raisonSociale = new RegExp(requête.params.recherche, "iu")

				const organisations = await requête.modèle.organisation.lister(filtres)

				réponse.json(organisations)
			}
			catch (erreur) {
				réponse.json([])
			}
		}

		else
			réponse.status(403).end()
	},

	"servicesOrganisation": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "AJAX")) {
			try {
				const organisation = await requête.modèle.organisation.obtenir(requête.params.organisation)

				if (organisation) {
					let services = organisation.services

					if (requête.params.recherche)
						services = services
						.filter(service => {
							return (new RegExp(requête.params.recherche, "iu")).test(service.nom)
						})

					réponse.json(services)
				}

				else
					réponse.json([])
			}
			catch (erreur) {
				réponse.json([])
			}
		}

		else
			réponse.status(403).end()
	},

	"formations": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "AJAX")) {
			try {
				let filtres = {}
				const expressionRégulière = new RegExp(requête.params.recherche, "iu")

				if (requête.params.recherche) {
					filtres = { "$or": [ { ...filtres, }, { ...filtres, }, ], }

					filtres["$or"][0].intituléCourt = expressionRégulière
					filtres["$or"][1].intituléComplet = expressionRégulière
				}

			const formations = await requête.modèle.formation.lister(filtres)

			réponse.json(formations)	
			}

			catch (erreur) {
				réponse.json([])
			}
		}

		else
			réponse.status(403).end()
	},

	"établissements": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "AJAX")) {
			try {
				const filtres = {}

				if (requête.params.recherche)
					filtres.nom = new RegExp(requête.params.recherche, "iu")

				const établissements = await requête.modèle.établissement.lister(filtres, [])

				réponse.json(établissements)
			}

			catch (erreur) {
				réponse.json([])
			}
		}

		else
			réponse.status(403).end()
	},

	"institutions": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "AJAX")) {
			try {
				const filtres = {}

				if (requête.params.recherche)
					filtres.nom = new RegExp(requête.params.recherche, "iu")

				const institutions = await requête.modèle.institution.lister(filtres)

				réponse.json(institutions)
			}

			catch (erreur) {
				réponse.json([])
			}
		}

		else
			réponse.status(403).end()
	},
}
