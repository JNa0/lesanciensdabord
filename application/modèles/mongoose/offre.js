
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId
const MongooseLeanVirtuals = require("mongoose-lean-virtuals")

const Assert = require("assert")
const chemin = require("path")
const systèmeFichiers = require("fs")

const schémaOffre = new Schéma({
	"intitulé": String,
	"service": { "type": ObjectId, "ref": "service", },
	"typeEmploi": String,
	"domaines": [ { "type": String, }, ],
	"dateDépôt": Date,
	"débutValidité": { "type": Date, "required": true, },
	"finValidité": { "type": Date, "required": true, },
}, { "collection": "offre", })

schémaOffre.plugin(MongooseLeanVirtuals)

schémaOffre.virtual("fichier")
	.get(function () {
		// Chemin sur le système de fichiers et chemin URL
		const cheminRéel = chemin.join(global.configuration.dossiers.application, "/téléversements/offres/"),
			cheminURL = "/fichiers/offres/"

		// Objet par défaut, si fichier joint non donné
		const fichier = { "existe": false, }

		// Puis cherche un fichier correspondant au nom d’utilisateur de l’organisation
		const nomFichierSupposé = `${this._id}.pdf`

		// Si une image personnalisée existe, l’affecte dans l’objet fichier
		if (systèmeFichiers.existsSync(chemin.join(cheminRéel, nomFichierSupposé))) {
			fichier.existe = true
			fichier.fichier = nomFichierSupposé
			fichier.adresseRéelle = cheminRéel + nomFichierSupposé
			fichier.adresse = cheminURL + nomFichierSupposé
		}

		return fichier
	})

schémaOffre.statics.obtenir = async function (identifiant, populations = null) {
	try {
		return await this
			.findById(identifiant)
			.populate(populations || {
				"path": "service",
				"populate": { "path": "organisation", },
			})
			.lean({ "virtuals": true, })
			.exec()
	}

	catch (erreur) {
		return null
	}
}

schémaOffre.statics.lister = async function (filtres = {}, populations = null, paramètres = null) {
	let requête = this
		.find(filtres)
		.populate(populations || {
			"path": "service",
			"populate": { "path": "organisation", },
		})

	if (paramètres !== null) {
		requête = requête
			.sort({ "intitulé": paramètres.ordreTri || "asc", })
			.skip(paramètres.saut || 0)
			.limit(paramètres.limite || undefined)
	}

	requête = requête.lean({ "virtuals": true, })

	return await requête.exec()
}

schémaOffre.statics.compter = async function (filtres = {}) {
	return await this.where(filtres).countDocuments()
}

schémaOffre.statics.créer = async function (champsFormulaire, estAdministrateur, options = {}) {
	// Cet objet ne retiendra que les champs validés
	// Le but est d’empêcher l’envoi de champs qui ne sont pas proposés par le formulaire et donc non vérifiés ici
	const création = {}

	const fichier = champsFormulaire.fichier

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.intitulé), "ERREUR_INTITULÉ")
				Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.intitulé), "ERREUR_INTITULÉ")

				const service = await Mongoose.model("service").obtenir(champsFormulaire.service, [])
				Assert.notStrictEqual(service, null, "ERREUR_SERVICE_INEXISTANT")

				création.intitulé = champsFormulaire.intitulé
				création.service = champsFormulaire.service

				// Si l’utilisateur n’est pas administrateur, il ne peut inscrire une offre que pour son organisation
				if (!estAdministrateur)
					// Vérifie que le service correspond à son organisation
					Assert.strictEqual(options.membre.service && options.membre.service.organisation._id.toString(), service.organisation.toString(), "ERREUR_ORGANISATION_SERVICE")

				else {
					// Vérifie l’existence de cette organisation
					const organisation = await Mongoose.model("organisation").obtenir(champsFormulaire.organisation, [])
					Assert.notStrictEqual(organisation, null, "ERREUR_ORGANISATION_INEXISTANTE")

					// Vérifie que le service correspond à cette organisation
					Assert.strictEqual(organisation._id.toString(), service.organisation.toString(), "ERREUR_ORGANISATION_SERVICE")
				}

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),

		// Récupère l’identifiant de type d’emploi comme clé étrangère
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.clésTypesEmploi.includes(champsFormulaire.typeEmploi), "ERREUR_TYPE_EMPLOI")

				création.typeEmploi = champsFormulaire.typeEmploi

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),

		// Génère la date de dépôt
		new Promise(async (résoudre, rejeter) => {
			try {
				création.dateDépôt = new Date()

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),

		// Génère la durée de validité
		new Promise(async (résoudre, rejeter) => {
			try {
				const périodeValidité = champsFormulaire.intervalleValidité.split(" - ")

				création.débutValidité = new Date(global.modules.transformerDate(périodeValidité[0]))
				création.finValidité = new Date(global.modules.transformerDate(périodeValidité[1]))

				Assert.ok(global.modules.validerPériode(création.débutValidité, création.finValidité), "ERREUR_PÉRIODE")

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),

		// Vérifie la validité du format MIME Type du fichier s’il existe
		// Définit l’existence de ce fichier dans l’objet
		new Promise(async (résoudre, rejeter) => {
			try {
				if (fichier) {
					Assert.ok(global.constantes.formatsOffre.includes(fichier.mimetype), "ERREUR_FORMAT")

					création.fichier = true

					résoudre(true)
				}

				else
					création.fichier = false

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),

		// Enregistre les domaines
		new Promise(async (résoudre, rejeter) => {
			try {
				const domainesReçus = champsFormulaire.domaines.split(",")

				// Filtre les domaines en n’en gardant que ceux réellement définis
				création.domaines = domainesReçus.filter(domaine => global.constantes.clésDomaines.includes(domaine))

				// Il doit y en avoir au moins un
				Assert.ok(création.domaines.length !== 0, "ERREUR_DOMAINE_MANQUANT")

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),
	])
	.then(async (réponses) => {
		try {
			// Déplace et renomme le fichier joint reçu dans le dossier des offres
			if (fichier)
				systèmeFichiers.renameSync(fichier.path, chemin.join(configuration.dossiers.téléversements, "/offres", nouvelleOffre._id.toString() + global.constantes.extensionsMIMETypes[fichier.mimetype]))

			// Crée la nouvelle instance et la sauvegarde en base de données
			const nouvelleOffre = new modèleOffre(création)
			await nouvelleOffre.save()

			return { "validé": true, }
		}

		catch (erreur) {
			// Supprime le fichier joint reçu
			if (fichier)
				systèmeFichiers.unlinkSync(fichier.path)

			return {
				"validé": false,
				"erreur": "ERREUR_INCONNUE",
			}
		}
	})
	.catch(erreur => {
		// Supprime le fichier joint reçu
		if (fichier)
			systèmeFichiers.unlinkSync(fichier.path)

		return {
			"validé": false,
			"erreur": erreur.message,
		}
	})
}

schémaOffre.statics.modifierGénéral = async function (identifiant, champsFormulaire, estAdministrateur) {
	const offre = await modèleOffre.obtenir(identifiant, []),
		modification = {}

	let fichier = champsFormulaire.fichier

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.intitulé), "ERREUR_INTITULÉ")

				Assert.ok(global.constantes.clésTypesEmploi.includes(champsFormulaire.typeEmploi), "ERREUR_TYPE_EMPLOI")

				modification.intitulé = champsFormulaire.intitulé
				modification.typeEmploi = champsFormulaire.typeEmploi

				const domainesReçus = champsFormulaire.domaines.split(",")

				// Filtre les domaines en n’en gardant que ceux réellement définis
				modification.domaines = domainesReçus.filter(domaine => global.constantes.clésDomaines.includes(domaine))

				// Il doit y en avoir au moins un
				Assert.ok(modification.domaines.length !== 0, "ERREUR_DOMAINE_MANQUANT")

				// Période de validité de l’offre
				const intervalleValidité = champsFormulaire.intervalleValidité.split(" - ")

				modification.débutValidité = new Date(global.modules.transformerDate(intervalleValidité[0]))
				modification.finValidité = new Date(global.modules.transformerDate(intervalleValidité[1]))

				Assert.ok(global.modules.validerPériode(modification.duréeValidité.début, modification.duréeValidité.fin), "ERREUR_PÉRIODE")

				if (estAdministrateur) {
					// Vérifie l’existence de l’organisation
					const organisation = await Mongoose.model("organisation").obtenir(champsFormulaire.organisation, [])
					Assert.notStrictEqual(organisation, null, "ERREUR_ORGANISATION_INEXISTANTE")

					// Vérifie l’existence du service
					const service = await Mongoose.model("service").obtenir(champsFormulaire.service, [])
					Assert.notStrictEqual(service, null, "ERREUR_SERVICE_INEXISTANT")

					// Vérifie que le service correspond à cette organisation
					Assert.strictEqual(organisation._id.toString(), service.organisation.toString(), "ERREUR_ORGANISATION_SERVICE")

					modification.service = champsFormulaire.service
				}

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),
		// Vérifie la validité du format MIME Type des fichiers s’ils existent
		// Définit l’extension de photographie si reçue ou la supprime si demandé
		new Promise (async (résoudre, rejeter) => {
			try {
				// Comportement fort : si un fichier est envoyé avec la demande de suppression, la suppression prime
				if (champsFormulaire.suppressionFichier) {
					// Supprime l’ancien fichier s’il existe
					if (offre.fichier.existe)
						systèmeFichiers.unlinkSync(offre.fichier.adresseRéelle)

					// Et celui reçu
					if (fichier) {
						systèmeFichiers.unlinkSync(fichier.path)
						fichier = null
					}
				}

				else if (fichier)
					Assert.ok(global.constantes.formatsFichierOffre.includes(fichier.mimetype), "ERREUR_FORMAT")

				résoudre(true)
			}

			catch (erreur) {
				rejeter(erreur)
			}
		})
	])
	.then(async (réponses) => {
		try {
			// Déplace et renomme le fichier joint reçu dans le dossier des fichiers d’offres
			if (fichier) {
				// Supprime l’ancien fichier
				if (offre.fichier.existe)
					systèmeFichiers.unlinkSync(offre.fichier.adresseRéelle)

				systèmeFichiers.renameSync(fichier.path, chemin.join(configuration.dossiers.téléversements, "/offres", offre._id + global.constantes.extensionsMIMETypes[fichier.mimetype]))
			}

			await modèleOffre.findByIdAndUpdate(offre._id, modification)

			return { "validé": true, }
		}

		catch (erreur) {console.log(erreur)
			// Supprime le fichier joint reçu s’il existe toujours
			if (fichier && systèmeFichiers.existsSync(fichier.path))
				systèmeFichiers.unlinkSync(fichier.path)

			return {
				"validé": false,
				"erreur": "ERREUR_INCONNUE",
			}
		}
	})
	.catch(erreur => {console.log(erreur)
		// Supprime le fichier joint reçu s’il existe toujours
		if (fichier && systèmeFichiers.existsSync(fichier.path))
			systèmeFichiers.unlinkSync(fichier.path)

		return {
			"validé": false,
			"erreur": erreur.message,
		}
	})
}

schémaOffre.statics.supprimer = async function (identifiant) {
	const offre = await this.obtenir(identifiant, [])

	if (offre) {
		// Supprime le fichier joint s’il existe
		if (offre.fichier.existe)
			systèmeFichiers.unlinkSync(chemin.join(global.configuration.dossiers.application, "/téléversements/offres/", offre._id.toString() + global.constantes.extensionsMIMETypes["application/pdf"]))

		// Puis supprime l’offre en base de données
		await this.findByIdAndDelete(offre._id).exec()

		return true
	}

	else
		return false
}

const modèleOffre = Mongoose.model("offre", schémaOffre)

module.exports = modèleOffre
