
const générerErreur = require("http-errors")
const Multer = require("multer")

const { rendre, afficher, afficherFormulaire, afficherInscription, inscrire, afficherModification, modifier, supprimer, routeParDéfaut, } = require("./outils")
const droits = require("./droits")

module.exports = {
	"afficherConnexion": async function (requête, réponse, fonctionSuivante) {
		afficherFormulaire(requête, réponse, {
			"droit": "connexion",
			"vue": "connexion",
			fonctionSuivante,
			"adresseRedirection": requête.query.vers || routeParDéfaut,
		})
	},

	"connecter": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "connexion")) {
			let connexionValidée = await requête.modèle.membre.validerConnexion(requête.body.nomUtilisateur, requête.body.motDePasse)

			if (connexionValidée) {
				requête.session.estConnecté = true
				requête.session.membre = await requête.modèle.membre.obtenir(requête.body.nomUtilisateur)
				requête.session.droits = global.droits[requête.session.membre.statut]

				réponse.redirect(requête.body.vers || routeParDéfaut)
			}

			else
				rendre(requête, réponse, "compte/connexion", { fonctionSuivante, }, {
					"connexionÉchouée": true,
					"vers": requête.body.vers || routeParDéfaut,
				})
		}

		else
			réponse.redirect(requête.query.vers || routeParDéfaut)
	},

	"déconnecter": async function (requête, réponse, fonctionSuivante) {
		if (droits.vérifier(requête.session, "déconnexion")) {
			requête.session.estConnecté = false
			requête.session.droits = global.droits.visiteur
			delete requête.session.membre
		}

		réponse.redirect(requête.body.vers || routeParDéfaut)
	},

	"afficherInscription": async function (requête, réponse, fonctionSuivante) {
		afficherInscription(requête, réponse, {
			"type": "membre",
			"vue": "inscription/membre",
			fonctionSuivante,
			"adresseRedirection": "/accueil",
		})
	},

	"inscrire": async function (requête, réponse, fonctionSuivante) {
		inscrire(requête, réponse, {
			"type": "membre",
			fonctionSuivante,
		})
	},

	"afficher": async function (requête, réponse, fonctionSuivante) {
		afficher(requête, réponse, {
			"type": "membre",
			"idInstance": requête.params.nomUtilisateur,
			"erreur": "membreInexistant",
			fonctionSuivante,
		}, { "estMonCompte": requête.session.estConnecté && requête.params.nomUtilisateur === requête.session.membre.nomUtilisateur, })
	},

	"afficherModification": async function (requête, réponse, fonctionSuivante) {
		réponse.redirect("modifier/général")
	},

	"afficherModificationGénéral": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"type": "membre",
			"vue": "membre/membre-général",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"afficherModificationOrganisation": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"type": "membre",
			"vue": "membre/membre-organisation",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"afficherModificationRecherche": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"type": "membre",
			"vue": "membre/membre-recherche",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"afficherModificationLiens": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"type": "membre",
			"vue": "membre/membre-liens",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"afficherModificationFormations": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"type": "membre",
			"vue": "membre/membre-formations",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"afficherModificationCompte": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"type": "membre",
			"vue": "membre/membre-compte",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"modifierGénéral": async function (requête, réponse, fonctionSuivante) {
		const membre = await requête.modèle.membre.obtenir(requête.params.nomUtilisateur)

		if (membre !== null) {
			if (true || ((session.estConnecté && membre._id === requête.session.membre._id) || requête.session.membre.statut === "administrateur")) {
				Multer({
					"dest": global.configuration.dossiers.téléversements,
					"limits": {
						"fieldSize": global.constantes.tailleFichierMaximale,
						"fileSize": global.constantes.tailleFichierMaximale,
					},
				}).fields([
					{ "name": "photographie", "maxCount": 1, },
					{ "name": "CV", "maxCount": 1, }
				])(requête, réponse, function (erreur) {
					if (requête.file)
						requête.body.fichier = requête.file

					if (requête.files)
						requête.body.fichiers = requête.files

					modifier(requête, réponse, {
						"vue": "membre/membre-général",
						"type": "membre",
						"méthode": "modifierGénéral",
						"erreur": erreur ? true : false,
						"idInstance": requête.params.nomUtilisateur,
					})
				})
			}

			else
				réponse.redirect(`/membre/${membre.nomUtilisateur}`)
		}

		else
			fonctionSuivante(générerErreur(404, "membreInexistant"))
	},

	"modifierOrganisation": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"mode": "modification",
			"vue": "membre/membre-organisation",
			"type": "membre",
			"méthode": "modifierOrganisation",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"modifierRecherche": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"mode": "modification",
			"vue": "membre/membre-recherche",
			"type": "membre",
			"méthode": "modifierRecherche",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"modifierLiens": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"mode": "modification",
			"vue": "membre/membre-liens",
			"type": "membre",
			"méthode": "modifierLiens",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"modifierFormations": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"mode": "modification",
			"vue": "membre/membre-formations",
			"type": "membre",
			"méthode": "modifierFormations",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"modifierCompte": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"mode": "modification",
			"vue": "membre/membre-compte",
			"type": "membre",
			"méthode": "modifierCompte",
			"idInstance": requête.params.nomUtilisateur,
			"codeErreur": "membreInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"supprimer": async function (requête, réponse, fonctionSuivante) {
		supprimer(requête, réponse, {
			"type": "membre",
			"idInstance": requête.params.nomUtilisateur,
			fonctionSuivante,
		})
	},
}
