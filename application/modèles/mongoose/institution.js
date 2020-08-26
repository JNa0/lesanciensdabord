
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId

const Assert = require("assert")

const schémaInstitution = new Schéma({
	"nom": { "type": String, "required": true, },
}, { "collection": "institution", })

schémaInstitution.statics.obtenir = async function (identifiant) {
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

schémaInstitution.statics.lister = async function (filtres = {}, paramètres = null) {
	let requête = this.find(filtres)

	if (paramètres !== null) {
		requête = requête
			.sort({ "nom": paramètres.ordreTri || "asc", })
			.skip(paramètres.saut || 0)
			.limit(paramètres.limite || undefined)
	}

	requête = requête.lean()

	return await requête.exec()
}

schémaInstitution.statics.créer = async function (champsFormulaire) {
	// Cet objet ne retiendra que les champs validés
	// Le but est d’empêcher l’envoi de champs qui ne sont pas proposés par le formulaire et donc non vérifiés ici
	const création = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.nom), "ERREUR_NOM")
				Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.nom), "ERREUR_NOM")

				création.nom = champsFormulaire.nom

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
			const nouvelleInstitution = new modèleInstitution(création)
			await nouvelleInstitution.save()

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

schémaInstitution.statics.supprimer = async function (identifiant) {
	try {
		return await this.findByIdAndDelete(identifiant).exec()
	}

	catch (erreur) {
		return null
	}
}

const modèleInstitution = Mongoose.model("institution", schémaInstitution)

module.exports = modèleInstitution
