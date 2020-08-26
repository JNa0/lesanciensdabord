
const générerErreur = require("http-errors")

const { afficher, afficherInscription, inscrire, afficherModification, supprimer } = require("./outils")

module.exports = {
	"afficherInscription": async function (requête, réponse, fonctionSuivante) {
		afficherInscription(requête, réponse, {
			"vue": "inscription/service",
			fonctionSuivante,
		})
	},

	"inscrire": async function (requête, réponse, fonctionSuivante) {
		inscrire(requête, réponse, {
			"type": "service",
			fonctionSuivante,
		})
	},

	"afficher": async function (requête, réponse, fonctionSuivante) {
		afficher(requête, réponse, {
			"type": "service",
			"idInstance": requête.params.identifiant,
			"erreur": "serviceInexistant",
			fonctionSuivante,
		})
	},

	"afficherModification": async function (requête, réponse, fonctionSuivante) {
		réponse.redirect("modifier/général")
	},

	"afficherModificationGénéral": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"vue": "service/service-général",
			"type": "service",
			"idInstance": requête.params.identifiant,
			"codeErreur": "serviceInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"afficherModificationCompte": async function (requête, réponse, fonctionSuivante) {
		if (true || (requête.session.estConnecté && requête.session.membre.statut === "administrateur")) {
			afficherModification(requête, réponse, {
				"vue": "service/service-compte",
				"type": "service",
				"idInstance": requête.params.identifiant,
				"codeErreur": "serviceInexistant",
				"fonctionSuivante": fonctionSuivante,
			})
		}
	},

	"modifierGénéral": async function (requête, réponse, fonctionSuivante) {
		afficherModification(requête, réponse, {
			"mode": "modification",
			"vue": "service/service-général",
			"type": "service",
			"méthode": "modifierGénéral",
			"idInstance": requête.params.identifiant,
			"codeErreur": "serviceInexistant",
			"fonctionSuivante": fonctionSuivante,
		})
	},

	"supprimer": async function (requête, réponse, fonctionSuivante) {
		supprimer(requête, réponse, {
			"type": "service",
			"adresse": "organisation/service",
			"idInstance": requête.params.identifiant,
			fonctionSuivante,
		})
	},
}
