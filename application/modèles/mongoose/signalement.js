
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId

const Assert = require("assert")

const schémaSignalement = new Schéma({
	"motif": { "type": String, "required": true, },
	"description": { "type": String, "required": true, },
	"adresse": { "type": String, "required": true, },
	"membre": { "type": ObjectId, "ref": "membre", },
	"dateCréation": { "type": Date, "required": true, },
}, { "collection": "signalement", })

schémaSignalement.statics.obtenir = async function (identifiant, populations = null) {
	try {
		return await this
			.findById(identifiant)
			.populate(populations)
			.lean()
			.exec()
	}

	catch (erreur) {
		return null
	}
}

schémaSignalement.statics.lister = async function (filtres = {}, populations = null, paramètres = null) {
	let requête = this
		.find(filtres)

	if (paramètres !== null) {
		requête = requête
			.sort({ "nom": paramètres.ordreTri || "asc", })
			.skip(paramètres.saut || 0)
			.limit(paramètres.limite || undefined)
	}

	requête = requête.lean({ "virtuals": true, })

	return await requête.exec()
}

schémaSignalement.statics.créer = async function (champsFormulaire, membre) {
	// Cet objet ne retiendra que les champs validés
	// Le but est d’empêcher l’envoi de champs qui ne sont pas proposés par le formulaire et donc non vérifiés ici
	const création = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.motif), "ERREUR_MOTIF")
				Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.motif), "ERREUR_MOTIF")
				Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.description), "ERREUR_DESCRIPTION")
				Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.adresse), "ERREUR_ADRESSE")

				création.motif = champsFormulaire.motif
				création.description = champsFormulaire.description
				création.adresse = champsFormulaire.adresse

				création.dateCréation = new Date()
				création.membre = membre._id

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
			const nouvelSignalement = new modèleSignalement(création)
			await nouvelSignalement.save()

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

schémaSignalement.statics.supprimer = async function (identifiant) {
	try {
		await this.findByIdAndDelete(identifiant).exec()

		return true
	}
	catch (erreur) {
		return false
	}
}

modèleSignalement = Mongoose.model("signalement", schémaSignalement)

module.exports = modèleSignalement
