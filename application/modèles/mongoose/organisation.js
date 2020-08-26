
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId
const MongooseLeanVirtuals = require("mongoose-lean-virtuals")

const Assert = require("assert")
const chemin = require("path")
const systèmeFichiers = require("fs")

const schémaOrganisation = new Schéma({
	"nomUtilisateur": String,
	"raisonSociale": String,
	"effectif": { "type": Number, "default": null, },
	"villeSiègeSocial": String,
	"codePostalSiègeSocial": String,
	"paysSiègeSocial": String,
	"extensionLogotype": { "type": String, "default": null, },
	"lienSiteProfessionnel": { "type": String, "default": null, },
	"lienLinkedIn": { "type": String, "default": null, },
	"lienViadeo": { "type": String, "default": null, },
}, { "collection": "organisation", })

schémaOrganisation.plugin(MongooseLeanVirtuals)

schémaOrganisation.virtual("logotype")
	.get(function () {
		// Chemin sur le système de fichiers et chemin URL
		const cheminRéel = chemin.join(global.configuration.dossiers.application, "/téléversements/images/organisations/"),
			cheminURL = "/fichiers/images/organisations/"

		// Objet par défaut, si logotype non donné
		const logotype = {
			"existe": false,
			// Image de profil par défaut
			"fichierParDéfaut": "anonyme.svg",
		}

		// Puis cherche un fichier correspondant au nom d’utilisateur de l’organisation
		const nomFichierSupposé = `${this.nomUtilisateur}${this.extensionLogotype}`

		// Si une image personnalisée existe, l’affecte dans l’objet logotype
		if (systèmeFichiers.existsSync(chemin.join(cheminRéel, nomFichierSupposé))) {
			logotype.existe = true
			logotype.fichier = nomFichierSupposé
		}

		else
			logotype.fichier = logotype.fichierParDéfaut

		logotype.adresseRéelle = cheminRéel + logotype.fichier
		logotype.adresseParDéfaut = cheminURL + logotype.fichierParDéfaut
		logotype.adresse = cheminURL + logotype.fichier

		return logotype
	})

schémaOrganisation.virtual("services", {
	"ref": "service",
	"localField": "_id",
	"foreignField": "organisation",
	"options": { "sort": { "nom": 1, }, },
})

schémaOrganisation.virtual("nombreOffres")
	.get(function () {
		// Si la propriété virtuelle “services” a été “populée”
		if (this.services instanceof Array)
			return this.services.reduce(function (nombreOffres, service) {
				return nombreOffres + service.offres.length
			}, 0)

		else
			return 0
	})

schémaOrganisation.statics.obtenir = async function (nomUtilisateur, populations = null) {
	try {
		return await this
			.findOne({ "nomUtilisateur": nomUtilisateur, })
			.populate(populations || {
				"path": "services",
				"populate": {
					"path": "offres",
				},
			})
			.lean({ "virtuals": true, })
			.exec()
	}

	catch (erreur) {
		return null
	}
}

schémaOrganisation.statics.lister = async function (filtres = {}, populations = null, paramètres = null) {
	let requête = this
		.find(filtres)
		.populate(populations || {
			"path": "services",
			"populate": { "path": "offres", },
		})

		if (paramètres) {
			requête = requête
				.sort({ "raisonSociale": paramètres.ordreTri || "asc", })
				.skip(paramètres.saut || 0)
				.limit(paramètres.limite || undefined)
		}

		requête = requête.lean({ "virtuals": true, })

	return await requête.exec()
}

schémaOrganisation.statics.compter = async function (filtres = {}) {
	return await this.where(filtres).countDocuments()
}

schémaOrganisation.statics.créer = async function (champsFormulaire) {
	// Cet objet ne retiendra que les champs validés
	// Le but est d’empêcher l’envoi de champs qui ne sont pas proposés par le formulaire et donc non vérifiés ici
	const création = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.raisonSociale), "ERREUR_RAISON_SOCIALE")
				Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.raisonSociale), "ERREUR_RAISON_SOCIALE")
				Assert.ok(global.constantes.formatNom.test(champsFormulaire.villeSiègeSocial), "ERREUR_VILLE")
				Assert.ok(global.constantes.formatCodePostal.test(champsFormulaire.codePostalSiègeSocial), "ERREUR_CODE_POSTAL")
				Assert.ok(global.constantes.clésPays.includes(champsFormulaire.paysSiègeSocial), "ERREUR_PAYS")
				Assert.ok(global.constantes.clésSecteursActivité.includes(champsFormulaire.secteurActivité), "ERREUR_SECTEUR_ACTIVITÉ")

				création.raisonSociale = champsFormulaire.raisonSociale
				création.villeSiègeSocial = champsFormulaire.villeSiègeSocial
				création.codePostalSiègeSocial = champsFormulaire.codePostalSiègeSocial
				création.paysSiègeSocial = champsFormulaire.paysSiègeSocial
				création.secteurActivité = champsFormulaire.secteurActivité

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),

		// Génère le nom d’utilisateur
		new Promise (async (résoudre, rejeter) => {
			try {
				création.nomUtilisateur = await global.modules.générerNomUtilisateur(this, global.modules.filtrerChaineCaractères(champsFormulaire.raisonSociale.toLowerCase(), global.constantes.caractèresInterditsNomUtilisateur))

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
			const nouvelleOrganisation = new modèleOrganisation(création)
			await nouvelleOrganisation.save()

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

schémaOrganisation.statics.modifierGénéral = async function (nomUtilisateur, champsFormulaire, estAdministrateur) {
	const organisation = await modèleOrganisation.obtenir(nomUtilisateur),
		modification = {}

	let fichier = champsFormulaire.fichier

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				// Vérifie l’effectif
				Assert.ok(global.constantes.formatNombre.test(champsFormulaire.effectif) || champsFormulaire.effectif === "", "ERREUR_EFFECTIF")

				modification.effectif = parseInt(champsFormulaire.effectif, 10) || null

				if (estAdministrateur) {
					Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.raisonSociale), "ERREUR_RAISON_SOCIALE")
					Assert.ok(global.constantes.formatNom.test(champsFormulaire.villeSiègeSocial), "ERREUR_VILLE")
					Assert.ok(global.constantes.formatCodePostal.test(champsFormulaire.codePostalSiègeSocial), "ERREUR_CODE_POSTAL")
					Assert.ok(global.constantes.clésPays.includes(champsFormulaire.paysSiègeSocial), "ERREUR_PAYS")
					Assert.ok(global.constantes.clésSecteurActivité.includes(champsFormulaire.secteurActivité), "ERREUR_SECTEUR_ACTIVITÉ")

					modification.raisonSociale = champsFormulaire.raisonSociale
					modification.villeSiègeSocial = champsFormulaire.villeSiègeSocial
					modification.codePostalSiègeSocial = champsFormulaire.codePostalSiègeSocial
					modification.paysSiègeSocial = champsFormulaire.paysSiègeSocial
					modification.secteurActivité = champsFormulaire.secteurActivité
				}

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),
		// Vérifie la validité du format MIME Type du fichier s’il existe
		// Définit l’extension de logotype si reçue ou la supprime si demandé
		new Promise(async function (résoudre, rejeter) {
			try {
				// Comportement fort : si une image est envoyée avec la demande de suppression, la suppression prime
				if (champsFormulaire.suppressionImage) {
					modification.extensionLogotype = null

					// Supprime l’ancien logotype s’il existe
					if (organisation.logotype.existe)
						systèmeFichiers.unlinkSync(organisation.logotype.adresseRéelle)

					// Et celui reçu
					if (fichier) {
						systèmeFichiers.unlinkSync(fichier.path)
						fichier = null
					}
				}

				else if (fichier) {
					Assert.ok(global.constantes.formatsLogotype.includes(fichier.mimetype), "ERREUR_FORMAT")

					modification.extensionLogotype = global.constantes.extensionsMIMETypes[fichier.mimetype]
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
			// Déplace et renomme le fichier joint reçu dans le dossier des images d’organisations
			if (fichier) {
				// Supprime l’ancien logotype
				if (organisation.logotype.existe)
					systèmeFichiers.unlinkSync(organisation.logotype.adresseRéelle)

				systèmeFichiers.renameSync(fichier.path, chemin.join(configuration.dossiers.téléversements, "/images/organisations", organisation.nomUtilisateur + modification.extensionLogotype))
			}

			await modèleOrganisation.findByIdAndUpdate(organisation._id, modification)

			return { "validé": true, }
		}

		catch (erreur) {
			// Supprime le fichier joint reçu s’il existe toujours
			if (fichier && systèmeFichiers.existsSync(fichier.path))
				systèmeFichiers.unlinkSync(fichier.path)

			return {
				"validé": false,
				"erreur": "ERREUR_INCONNUE",
			}
		}
	})
	.catch(erreur => {
			// Supprime le fichier joint reçu s’il existe toujours
			if (fichier && systèmeFichiers.existsSync(fichier.path))
				systèmeFichiers.unlinkSync(fichier.path)

		return {
			"validé": false,
			"erreur": erreur.message,
		}
	})
}

schémaOrganisation.statics.modifierLiens = async function (nomUtilisateur, champsFormulaire, estAdministrateur) {
	const organisation = await modèleOrganisation.obtenir(nomUtilisateur),
		modification = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatLienSite.test(champsFormulaire.lienSiteProfessionnel) || champsFormulaire.lienSiteProfessionnel === "", "ERREUR_LIEN_SITE_PROFESSIONNEL")
				Assert.ok(global.constantes.formatLienLinkedIn.test(champsFormulaire.lienLinkedIn) || champsFormulaire.lienLinkedIn === "", "ERREUR_LIEN_LINKEDIN")
				Assert.ok(global.constantes.formatLienPersonneViadeo.test(champsFormulaire.lienViadeo) || champsFormulaire.lienViadeo === "", "ERREUR_LIEN_VIADEO")

				// Si les champs sont restés vides, leur valeur par défaut sera null
				modification.lienSiteProfessionnel = champsFormulaire.lienSiteProfessionnel || null
				modification.lienLinkedIn = champsFormulaire.lienLinkedIn || null
				modification.lienViadeo = champsFormulaire.lienViadeo || null

				résoudre(true)
			}

			catch (erreur) {
				rejeter(erreur)
			}
		}),
	])
	.then(async (réponses) => {
		try {
			await modèleOrganisation.findByIdAndUpdate(organisation._id, modification)

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

schémaOrganisation.statics.modifierCompte = async function (nomUtilisateur, champsFormulaire, estAdministrateur) {
	const organisation = await modèleOrganisation.obtenir(nomUtilisateur),
		modification = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				if (estAdministrateur) {
					Assert.ok(global.constantes.formatNomUtilisateur.test(champsFormulaire.nomUtilisateur), "ERREUR_NOM_UTILISATEUR")

					modification.nomUtilisateur = champsFormulaire.nomUtilisateur
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
			await modèleOrganisation.findByIdAndUpdate(organisation._id, modification)

			// Indique un changement du nom d’utilisateur pour préparer une redirection URL
			if (modification.nomUtilisateur !== organisation.nomUtilisateur)
				return {
					"validé": true,
					"nouvelIdInstance": modification.nomUtilisateur,
				}

			else
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

schémaOrganisation.statics.supprimer = async function (nomUtilisateur) {
	const organisation = await this.obtenir(nomUtilisateur, [])

	if (organisation) {
		// Supprime le logotype si elle existe
		if (organisation.logotype.existe)
			systèmeFichiers.unlinkSync(organisation.logotype.adresseRéelle)

		// Supprime les services associés en conséquence
		const services = await Mongoose.model("service").lister({ "organisation": organisation._id, }, [])

		for (service of services)
			await Mongoose.model("service").supprimer(service._id)

		// Puis supprime l’organisation
		await this.findByIdAndDelete(organisation._id).exec()

		return true
	}

	else
		return false
}

const modèleOrganisation = Mongoose.model("organisation", schémaOrganisation)

module.exports = modèleOrganisation
