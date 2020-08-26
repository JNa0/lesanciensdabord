
const générerErreur = require("http-errors")
const Multer = require("multer")

const { rendre, afficher, afficherInscription, inscrire, afficherModification, modifier, supprimer, afficherAnnuaire, routeParDéfaut, } = require("./outils")

module.exports = {
	"afficherInscription": async function (requête, réponse, fonctionSuivante) {
		afficherInscription(requête, réponse, {
			"vue": "inscription/offre",
			fonctionSuivante,
		})
	},

	"inscrire": async function (requête, réponse, fonctionSuivante) {
		Multer({
			"dest": global.configuration.dossiers.téléversements,
			"limits": {
				"fieldSize": global.constantes.tailleFichierMaximale,
				"fileSize": global.constantes.tailleFichierMaximale,
			},
		}).single("fichier")(requête, réponse, function (erreur) {
			if (requête.file)
				requête.body.fichier = requête.file

			if (requête.files)
				requête.body.fichiers = requête.files

			inscrire(requête, réponse, {
				"type": "offre",
				"erreur": erreur ? true : false,
				fonctionSuivante,
			})
		})
	},

	"afficher": async function (requête, réponse, fonctionSuivante) {
		afficher(requête, réponse, {
			"type": "offre",
			"idInstance": requête.params.identifiant,
			"erreur": "offreInexistante",
			fonctionSuivante,
		})
	},

	"afficherModification": async function (requête, réponse, fonctionSuivante) {
		réponse.redirect("modifier/général")
	},

	"afficherModificationGénéral": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"vue": "offre/offre-général",
			"type": "offre",
			"idInstance": requête.params.identifiant,
			"codeErreur": "offreInexistante",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"afficherModificationCompte": async function (requête, réponse, fonctionSuivante) {
		if (true || (requête.session.estConnecté && requête.session.membre.statut === "administrateur")) {
			afficherModification(requête, réponse, {
				"vue": "offre/offre-compte",
				"type": "offre",
				"idInstance": requête.params.identifiant,
				"codeErreur": "offreInexistante",
				"fonctionSuivante": fonctionSuivante,
			})
		}
	},

	"modifierGénéral": async function (requête, réponse, fonctionSuivante) {
		const offre = await requête.modèle.offre.obtenir(requête.params.identifiant, [])

		if (offre !== null) {
			if (true || ((session.estConnecté && false) || requête.session.membre.statut === "administrateur")) {
				Multer({
					"dest": global.configuration.dossiers.téléversements,
					"limits": {
						"fieldSize": global.constantes.tailleFichierMaximale,
						"fileSize": global.constantes.tailleFichierMaximale,
					},
				}).single("fichier")(requête, réponse, function (erreur) {
					if (requête.file)
						requête.body.fichier = requête.file

					modifier(requête, réponse, {
						"vue": "offre/offre-général",
						"type": "offre",
						"méthode": "modifierGénéral",
						"erreur": erreur ? true : false,
						"idInstance": requête.params.identifiant,
					})
				})
			}

			else
				réponse.redirect(`/offre/${offre._id}`)
		}

		else
			fonctionSuivante(générerErreur(404, "offreInexistante"))
	},

	"supprimer": async function (requête, réponse, fonctionSuivante) {
		supprimer(requête, réponse, {
			"type": "offre",
			"idInstance": requête.params.identifiant,
			fonctionSuivante,
		})
	},

	"lister": async function (requête, réponse, fonctionSuivante) {
		afficherAnnuaire(requête, réponse, {
			"type": "offre",
			"vue": "annuaire/offres",
			fonctionSuivante,
		})
	},

	"listerCandidats": async function (requête, réponse, fonctionSuivante) {
		const offre = await requête.modèle.offre.obtenir(requête.params.identifiant, [])

		if (offre !== null) {
			try {
				afficherAnnuaire(requête, réponse, {
					"droit": "listeCandidats",
					"type": {
						"réel": "membre",
						"virtuel": "candidat",
					},
					"vue": "annuaire/candidats",
					"filtres": {
						"offre": requête.params.identifiant,
					},
					"instance": offre,
					fonctionSuivante,
				}, { offre, })
			}

			catch (erreur) {
				fonctionSuivante(générerErreur(500, "erreurInterne"))
			}
		}

		else
			fonctionSuivante(générerErreur(404, "offreInexistante"))
	},
}
