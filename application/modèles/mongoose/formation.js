
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId

const Assert = require("assert")

const schémaFormation = new Schéma({
	"intituléCourt": { "type": String, "required": true, },
	"intituléComplet": { "type": String, "required": true, },
}, { "collection": "formation", })

schémaFormation.statics.obtenir = async function (identifiant) {
	try {
		return await this
			.findById(identifiant)
			.lean()
			.exec()
	}

	catch (erreur) {
		return null
	}
}

schémaFormation.statics.lister = async function (filtres = {}, paramètres = null) {
	let requête = this.find(filtres)

	if (paramètres !== null) {
		requête = requête
			.sort({ "intituléComplet": paramètres.ordreTri || "asc", })
			.skip(paramètres.saut || 0)
			.limit(paramètres.limite || undefined)
	}

	requête = requête.lean()

	return await requête.exec()
}

schémaFormation.statics.créer = async function (champsFormulaire) {
	// Cet objet ne retiendra que les champs validés
	// Le but est d’empêcher l’envoi de champs qui ne sont pas proposés par le formulaire et donc non vérifiés ici
	const création = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.intituléCourt), "ERREUR_INTITULÉ_COURT")
				Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.intituléCourt), "ERREUR_INTITULÉ_COURT")

				Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.intituléComplet), "ERREUR_INTITULÉ_COMPLET")
				Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.intituléComplet), "ERREUR_INTITULÉ_COMPLET")

				création.intituléCourt = champsFormulaire.intituléCourt
				création.intituléComplet = champsFormulaire.intituléComplet

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),
	])
	.then(async (réponses) => {
		try {
			// Crée la nouvelle instance et la sauvegarde en base de données
			const nouvelleFormation = new modèleFormation(création)
			await nouvelleFormation.save()

			return { "validé": true, }
		}

		catch (erreur) {
			return {
				"validé": false,
				"erreur": "ERREUR_INCONNUE",
			}
		}
	})
	.catch(erreur => {
		return {
			"validé": false,
			"erreur": erreur.message,
		}
	})
}

schémaFormation.statics.supprimer = async function (identifiant) {
	try {
		return await this.findByIdAndDelete(identifiant).exec()
	}

	catch (erreur) {
		return null
	}
}

const modèleFormation = Mongoose.model("formation", schémaFormation)

module.exports = modèleFormation
