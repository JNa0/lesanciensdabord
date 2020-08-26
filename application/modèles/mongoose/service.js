
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId
const MongooseLeanVirtuals = require("mongoose-lean-virtuals")

const Assert = require("assert")

const schémaService = new Schéma({
	"organisation": { "type": ObjectId, "ref": "organisation", },
	"nom": String,
	"ville": String,
	"codePostal": String,
	"pays": String,
}, { "collection": "service", })

schémaService.plugin(MongooseLeanVirtuals)

schémaService.virtual("offres", {
	"ref": "offre",
	"localField": "_id",
	"foreignField": "service",
	"options": { "sort": { "intitulé": 1, }, },
})

schémaService.virtual("adresse")
	.get(function () {
		return `${this.ville} (${this.codePostal})`
	})

schémaService.statics.obtenir = async function (identifiant, populations = null) {
	try {
		return await this
			.findById(identifiant)
			.populate(populations || [
				{ "path": "organisation", },
				{ "path": "offres", },
			])
			.lean({ "virtuals": true, })
			.exec()
	}

	catch (erreur) {
		return null
	}
}

schémaService.statics.lister = async function (filtres = {}, populations = null, paramètres = null) {
	let requête = this
		.find(filtres)
		.populate(populations || "organisation")

	if (paramètres) {
		requête = requête
			.sort({ "nom": paramètres.ordreTri || "asc", })
			.skip(paramètres.saut || 0)
			.limit(paramètres.limite || undefined)
	}

	requête = requête.lean({ "virtuals": true, })

	return await requête.exec()
}

schémaService.statics.créer = async function (champsFormulaire) {
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

				// Vérifie l’existence de cette organisation
				const organisation = await Mongoose.model("organisation").obtenir(champsFormulaire.organisation, [])
				Assert.notStrictEqual(organisation, null, "ERREUR_ORGANISATION_INEXISTANTE")

				création.organisation = organisation._id

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
			const nouveauService = new modèleService(création)
			await nouveauService.save()

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

schémaService.statics.modifierGénéral = async function (identifiant, champsFormulaire, estAdministrateur) {
	const service = await modèleService.obtenir(identifiant),
		modification = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				if (estAdministrateur) {
					Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.nom), "ERREUR_NOM")

					Assert.ok(global.constantes.formatNom.test(champsFormulaire.ville), "ERREUR_VILLE")

					Assert.ok(global.constantes.formatCodePostal.test(champsFormulaire.codePostal), "ERREUR_CODE_POSTAL")

					Assert.ok(global.constantes.clésPays.includes(champsFormulaire.pays), "ERREUR_PAYS")

					// Cherche l’organisation correspondant et n’en garde que l’identifiant
					const organisation = await Mongoose.model("organisation").obtenir(champsFormulaire.organisation, [])
					Assert.notStrictEqual(organisation, null, ERREUR_ORGANISATION_INEXISTANTE)

					modification.nom = champsFormulaire.nom
					modification.ville = champsFormulaire.ville
					modification.codePostal = champsFormulaire.codePostal
					modification.pays = champsFormulaire.pays
					modification.organisation = organisation._id
				}

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),
	])
	.then(async (réponses) => {
		try {
			await modèleService.findByIdAndUpdate(service._id, modification)

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

schémaService.statics.supprimer = async function (identifiant) {
	const service = await this.obtenir(identifiant)

	if (service) {
		// Supprime les offres associées
		for (offre of service.offres)
			await Mongoose.model("offre").supprimer(offre._id)

		// Passe le service à null pour tous les membres associés
		const membres = await Mongoose.model("membre").lister({ "service": service._id, })

		for (membre of membres)
			await Mongoose.model("membre").modifier(membre.nomUtilisateur, { "service": null, })

		// Puis supprime le service
		await this.findByIdAndDelete(service._id).exec()

		return true
	}

	else
		return false
}

const modèleService = Mongoose.model("service", schémaService)

module.exports = modèleService
