
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId

const Assert = require("assert")

const schémaÉtablissement = new Schéma({
	"nom": { "type": String, "required": true, },
	"ville": { "type": String, "required": true, },
	"codePostal": { "type": String, "required": true, },
	"pays": { "type": String, "required": true, },
	"institution": { "type": ObjectId, "ref": "institution", },
}, { "collection": "etablissement", })

schémaÉtablissement.virtual("adresse")
	.get(function () {
		return `${this.ville} (${this.codePostal}), ${this.pays}`
	})

schémaÉtablissement.statics.obtenir = async function (identifiant, populations = null) {
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

schémaÉtablissement.statics.lister = async function (filtres = {}, populations = null, paramètres = null) {
	let requête = this
		.find(filtres)
		.populate(populations || "institution")

	if (paramètres !== null) {
		requête = requête
			.sort({ "nom": paramètres.ordreTri || "asc", })
			.skip(paramètres.saut || 0)
			.limit(paramètres.limite || undefined)
	}

	requête = requête.lean({ "virtuals": true, })

	return await requête.exec()
}

schémaÉtablissement.statics.créer = async function (champsFormulaire) {
	// Cet objet ne retiendra que les champs validés
	// Le but est d’empêcher l’envoi de champs qui ne sont pas proposés par le formulaire et donc non vérifiés ici
	const création = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.nom), "ERREUR_NOM")
				Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.nom), "ERREUR_NOM")
				Assert.ok(global.constantes.formatNom.test(champsFormulaire.ville), "ERREUR_VILLE")
				Assert.ok(global.constantes.formatCodePostal.test(champsFormulaire.codePostal), "ERREUR_CODE_POSTAL")
				Assert.ok(global.constantes.clésPays.includes(champsFormulaire.pays), "ERREUR_PAYS")

				création.nom = champsFormulaire.nom
				création.ville = champsFormulaire.ville
				création.codePostal = champsFormulaire.codePostal
				création.pays = champsFormulaire.pays

				const institution = await Mongoose.model("institution").obtenir(champsFormulaire.institution)
				Assert.notStrictEqual(institution, null, "ERREUR_INSTITUTION_INEXISTANTE")

				création.institution = champsFormulaire.institution

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
			const nouvelÉtablissement = new modèleÉtablissement(création)
			await nouvelÉtablissement.save()

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

schémaÉtablissement.statics.supprimer = async function (identifiant) {
	try {
		return await this.findByIdAndDelete(identifiant).exec()
	}

	catch (erreur) {
		return null
	}
}

modèleÉtablissement = Mongoose.model("établissement", schémaÉtablissement)

module.exports = modèleÉtablissement
