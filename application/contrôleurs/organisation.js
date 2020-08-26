
const générerErreur = require("http-errors")
const Multer = require("multer")

const { rendre, afficher, afficherInscription, inscrire, afficherModification, modifier, supprimer, routeParDéfaut, } = require("./outils")

module.exports = {
	"afficherInscription": async function (requête, réponse, fonctionSuivante) {
		afficherInscription(requête, réponse, {
			"vue": "inscription/organisation",
			fonctionSuivante,
		})
	},

	"inscrire": async function (requête, réponse, fonctionSuivante) {
		inscrire(requête, réponse, {
			"type": "organisation",
			fonctionSuivante,
		})
	},

	"afficher": async function (requête, réponse, fonctionSuivante) {
		afficher(requête, réponse, {
			"type": "organisation",
			"idInstance": requête.params.nomUtilisateur,
			"erreur": "organisationInexistante",
			fonctionSuivante,
		})
	},

	"afficherModification": async function (requête, réponse, fonctionSuivante) {
		réponse.redirect("modifier/général")
	},

	"afficherModificationGénéral": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"vue": "organisation/organisation-général",
			"type": "organisation",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "organisationInexistante",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"afficherModificationLiens": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"vue": "organisation/organisation-liens",
			"type": "organisation",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "organisationInexistante",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"afficherModificationCompte": async function (requête, réponse, fonctionSuivante) {
		if (true || (requête.session.estConnecté && requête.session.membre.statut === "administrateur")) {
			afficherModification(requête, réponse, {
				"vue": "organisation/organisation-compte",
				"type": "organisation",
				"idInstance": requête.params.nomUtilisateur,
				"codeErreur": "organisationInexistante",
				"fonctionSuivante": fonctionSuivante,
			})
		}
	},

	"modifierGénéral": async function (requête, réponse, fonctionSuivante) {
		const organisation = await requête.modèle.organisation.obtenir(requête.params.nomUtilisateur)

		if (organisation !== null) {
			if (true || ((session.estConnecté && false) || requête.session.membre.statut === "administrateur")) {
				Multer({
					"dest": global.configuration.dossiers.téléversements,
					"limits": {
						"fieldSize": global.constantes.tailleFichierMaximale,
						"fileSize": global.constantes.tailleFichierMaximale,
					},
				}).single("logotype")(requête, réponse, function (erreur) {
					if (requête.file)
						requête.body.fichier = requête.file

					modifier(requête, réponse, {
						"vue": "organisation/organisation-général",
						"type": "organisation",
						"méthode": "modifierGénéral",
						"erreur": erreur ? true : false,
						"idInstance": requête.params.nomUtilisateur,
					})
				})
			}

			else
				réponse.redirect(`/organisation/${organisation.nomUtilisateur}`)
		}

		else
			fonctionSuivante(générerErreur(404, "organisationInexistante"))
	},

	"modifierLiens": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"mode": "modification",
			"vue": "organisation/organisation-liens",
			"type": "organisation",
			"méthode": "modifierLiens",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"modifierCompte": async function (requête, réponse, fonctionSuivante) {
		if (true || (requête.session.estConnecté && requête.session.membre.statut === "administrateur")) {
			afficherModification(requête, réponse, {
				"mode": "modification",
				"vue": "organisation/organisation-compte",
				"type": "organisation",
				"méthode": "modifierCompte",
				"idInstance": requête.params.nomUtilisateur,
				"codeErreur": "membreInexistant",
				"fonctionSuivante": fonctionSuivante,
			})
		}
	},

	"supprimer": async function (requête, réponse, fonctionSuivante) {
		supprimer(requête, réponse, {
			"type": "organisation",
			"idInstance": requête.params.identifiant,
			fonctionSuivante,
		})
	},
}
