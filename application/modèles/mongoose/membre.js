
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId
const MongooseLeanVirtuals = require("mongoose-lean-virtuals")

const Assert = require("assert")
const chemin = require("path")
const systèmeFichiers = require("fs")
const BCrypt = require("bcrypt")

// « jà » est un mot d’ancien français signifiant « l’instant présent »
const jà = new Date(),
	limiteAntérieureNaissance = new Date(),
	limitePostérieureNaissance = new Date()

// Les limites dans les quelles on considère qu’une personne peut être née
limiteAntérieureNaissance.setYear(jà.getFullYear() - 100)
limitePostérieureNaissance.setYear(jà.getFullYear() - 15)

const schémaMembre = new Schéma({
	"estValidé": { "type": Boolean, "default": false, },
	"dateInscription": { "type": Date, "required": true, },
	"dateDernièreConnexion": { "type": Date, "default": null, },
	"nomUtilisateur": { "type": String, "required": true, "unique": true, },
	"motDePasse": { "type": String, "required": true, },
	"prénom": { "type": String, "required": true, },
	"nomPatronymique": { "type": String, "required": true, },
	"nomMarital": { "type": String, "default": null, },
	"civilité": { "type": Boolean, "required": true, },
	"dateNaissance": { "type": Date, "min": limiteAntérieureNaissance, "max": limitePostérieureNaissance, "required": true, },
	"statut": { "type": String, "required": true, },
	"extensionPhotographie": { "type": String, "default": null, },
	"lienLinkedIn": { "type": String, "default": null, },
	"lienViadeo": { "type": String, "default": null, },
	"lienSitePersonnel": { "type": String, "default": null, },
	"adresseMél": { "type": String, "required": true, "unique": true, },
	"numéroTéléphone": { "type": String, "default": null, },
	"posteActuel": { "type": String, "default": null, },
	"service": { "type": ObjectId, "default": null, "ref": "service", },
	"recherche": { "type": ObjectId, "required": true, "ref": "recherche", },
	"traitementDonnéesPersonnelles": { "type": Boolean, "required": true, },
	"traitementDonnéesProfessionnelles": { "type": Boolean, "required": true, },
}, { "collection": "membre", })

schémaMembre.plugin(MongooseLeanVirtuals)

schémaMembre.virtual("nom")
	.get(function () {
		return this.nomMarital || this.nomPatronymique
	})

schémaMembre.virtual("nomComplet")
	.get(function () {
		return this.prénom + " " + this.nom
	})

schémaMembre.virtual("photographie")
	.get(function () {
		// Chemin sur le système de fichiers et chemin URL
		const cheminRéel = chemin.join(global.configuration.dossiers.application, "/téléversements/images/membres/"),
			cheminURL = "/fichiers/images/membres/"

		// Objet par défaut, si photographie non donnée
		const photographie = {
			"existe": false,
			// Image de profil par défaut
			"fichierParDéfaut": "anonyme.svg",
		}

		// Puis cherche un fichier correspondant au nom d’utilisateur du membre
		const nomFichierSupposé = `${this.nomUtilisateur}${this.extensionPhotographie}`

		// Si une image personnalisée existe, l’affecte dans l’objet photographie
		if (systèmeFichiers.existsSync(chemin.join(cheminRéel, nomFichierSupposé))) {
			photographie.existe = true
			photographie.fichier = nomFichierSupposé
		}

		else
			photographie.fichier = photographie.fichierParDéfaut

		photographie.adresseRéelle = cheminRéel + photographie.fichier
		photographie.adresseParDéfaut = cheminURL + photographie.fichierParDéfaut
		photographie.adresse = cheminURL + photographie.fichier

		return photographie
	})

schémaMembre.virtual("CV")
	.get(function () {
		// Chemin sur le système de fichiers et chemin URL
		const cheminRéel = chemin.join(global.configuration.dossiers.application, "/téléversements/cv/"),
			cheminURL = "/fichiers/cv/"

		// Objet par défaut, si CV non donné
		const CV = {
			"existe": false,
		}

		// Puis cherche un fichier correspondant au nom d’utilisateur du membre
		const nomFichierSupposé = `${this.nomUtilisateur}.pdf`

		// Si le CV existe, l’affecte dans l’objet CV
		if (systèmeFichiers.existsSync(chemin.join(cheminRéel, nomFichierSupposé))) {
			CV.existe = true
			CV.fichier = nomFichierSupposé

			CV.adresseRéelle = cheminRéel + CV.fichier
			CV.adresse = cheminURL + CV.fichier
		}

		return CV
	})

schémaMembre.virtual("inscriptions", {
	"ref": "inscription",
	"localField": "_id",
	"foreignField": "membre",
	"options": { "sort": { "dateSortie": -1, }, },
})

schémaMembre.virtual("promotion")
	.get(function () {
		// La promotion (pour les étudiant(e)s et ancien(ne)s étudiant(e)s)
		if ([ "étudiant", "ancien", ].includes(this.statut) && this.inscriptions instanceof Array) {
			const DUT = this.inscriptions.find(inscription => inscription.formation.intituléCourt === "DUT Informatique")
			const promotion = {}

			if (DUT) {
				const jà = new Date()

				// Si c’est un(e) ancien(ne) étudiant(e)
				if (this.statut === "ancien")
					promotion.annéeEnCours = 0

				// Si c’est un(e) étudiant(e)
				else {
					// Si on est en juillet ou après et que l’année est d’un an inférieure à celle de fin
					// Ou qu’on est en aout ou avant et que l’année est égale à celle de sortie
					// Alors on est en 2e année (prenant en compte le cas des alternants)
					// Mais ça ne prend pas en compte le cas des profils non mis à jour… sauf si la mise à jour est automatisée
					if ((jà.getMonth() >= 7 && jà.getFullYear() == (DUT.dateSortie.getFullYear() - 1)) ||
						(jà.getMonth() <= 8 && jà.getFullYear() == DUT.dateSortie.getFullYear()))
						promotion.annéeEnCours = 2

					else
						promotion.annéeEnCours = 1
				}

				promotion.dateSortie = DUT.dateSortie.getFullYear()

				return promotion
			}

			else
				return null
		}

		else
			return null
	})

// Retourne une version complète du document : des propriétés virtuelles et des clés étrangères ont été intégrées dans l’objet
schémaMembre.statics.obtenir = async function (nomUtilisateur, populations = null) {
	let requête = this
		.findOne({ "nomUtilisateur": nomUtilisateur, })
		.populate(populations || [
			"recherche",
			{
				"path": "service",
				"populate": { "path": "organisation", },
			},
			{
				"path": "inscriptions",
				"populate": [
					{ "path": "formation" },
					{
						"path": "établissement",
						"populate": { "path": "institution", },
					},
				],
			}
		])

	requête = requête.lean({ "virtuals": true, })

	return await requête.exec()
}

schémaMembre.statics.lister = async function (filtres = {}, populations = null, paramètres = null) {
	let requête = this
		.find(filtres)
		.populate(populations || [
			{
				"path": "service",
				"populate": { "path": "organisation", },
			},
			{
				"path": "inscriptions",
				"populate": { "path": "formation", },
			}
		])

	if (paramètres !== null) {
		requête = requête
			.sort({ "prénom": paramètres.ordreTri || "asc", })
			.skip(paramètres.saut || 0)
			.limit(paramètres.limite || undefined)
	}

	requête = requête.lean({ "virtuals": true, })

	return await requête.exec()
}

schémaMembre.statics.compter = async function (filtres = {}) {
	return await this.where(filtres).countDocuments()
}

schémaMembre.statics.validerConnexion = async function (nomUtilisateur, motDePasse) {
	let membre = await this.obtenir(nomUtilisateur, [])

	if (membre === null || membre.estValidé === false)
		return false

	else if (await BCrypt.compare(motDePasse, membre.motDePasse)) {
		await this.updateOne({ "_id": membre._id, }, { "dateDernièreConnexion": new Date(), })

		return true
	}

	else
		return false
}

schémaMembre.statics.créer = async function (champsFormulaire, options = {}) {
	const motDePasse = require("unique-string")()

	// Cet objet ne retiendra que les champs validés
	// Le but est d’empêcher l’envoi de champs qui ne sont pas proposés par le formulaire et donc non vérifiés ici, ouvrant la porte à des failles de sécurité
	const création = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatNom.test(champsFormulaire.prénom), "ERREUR_PRÉNOM")
				Assert.ok(global.constantes.formatNom.test(champsFormulaire.nomPatronymique), "ERREUR_NOM_PATRONYMIQUE")
				Assert.ok(global.constantes.formatNom.test(champsFormulaire.nomMarital) || champsFormulaire.nomMarital === "", "ERREUR_NOM_MARITAL")
				Assert.ok(global.constantes.formatAdresseMél.test(champsFormulaire.adresseMél), "ERREUR_ADRESSE_MÉL")

				Assert.ok([ "true", "false", true, false, ].includes(champsFormulaire.civilité), "ERREUR_CIVILITÉ")

				Assert.ok(champsFormulaire.traitementDonnéesPersonnelles === "true", "ERREUR_AUTORISATION_TRAITEMENT_DONNÉES_PERSONNELLES")
				Assert.ok(champsFormulaire.traitementDonnéesProfessionnelles === "true", "ERREUR_AUTORISATION_TRAITEMENT_DONNÉES_PROFESSIONNELLES")

				Assert.ok(global.constantes.clésStatuts.includes(champsFormulaire.statut), "ERREUR_STATUT")
				Assert.notStrictEqual(champsFormulaire.statut, "administrateur", "ERREUR_TYPE_ADMINISTRATEUR")

				création.prénom = champsFormulaire.prénom
				création.nomPatronymique = champsFormulaire.nomPatronymique
				création.nomMarital = champsFormulaire.nomMarital || null
				création.adresseMél = champsFormulaire.adresseMél
				création.civilité = champsFormulaire.civilité
				création.traitementDonnéesPersonnelles = champsFormulaire.traitementDonnéesPersonnelles
				création.traitementDonnéesProfessionnelles = champsFormulaire.traitementDonnéesProfessionnelles
				création.statut = champsFormulaire.statut

				création.dateNaissance = new Date(global.modules.transformerDate(champsFormulaire.dateNaissance))

				Assert.ok(global.modules.validerDate(création.dateNaissance), "ERREUR_DATE")
				Assert.ok(création.dateNaissance >= limiteAntérieureNaissance, "ERREUR_DATE")
				Assert.ok(création.dateNaissance <= limitePostérieureNaissance, "ERREUR_DATE")

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),

		// Définit le mot de passe
		new Promise(async (résoudre, rejeter) => {
			try {
				création.motDePasse = await BCrypt.hash(motDePasse, global.constantes.degréSalage)

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),

		// Génère le nom d’utilisateur
		new Promise(async (résoudre, rejeter) => {
			try {
				création.nomUtilisateur = await global.modules.générerNomUtilisateur(this, global.modules.filtrerChaineCaractères(création.prénom.toLowerCase(), global.constantes.caractèresInterditsNomUtilisateur) + global.modules.filtrerChaineCaractères((création.nomMarital || création.nomPatronymique).toLowerCase(), global.constantes.caractèresInterditsNomUtilisateur))

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),

		// Génère la date d’inscription
		new Promise(async (résoudre, rejeter) => {
			try {
				création.dateInscription = new Date()

				résoudre(true)
			}
			catch (erreur) {
				rejeter(erreur)
			}
		}),
	])
	.then(async (réponses) => {
		try {
			// Crée une instance de recherche associée à ce membre
			const nouvelleRecherche = new Mongoose.model("recherche")()
			await nouvelleRecherche.save()

			// Et branche cette recherche sur le membre
			création.recherche = nouvelleRecherche.get("_id")

			// Crée la nouvelle instance et la sauvegarde en base de données
			const nouveauMembre = new modèleMembre(création)
			await nouveauMembre.save()
/*
			const NodeMailer = require("nodemailer")

			const transporteur = NodeMailer.createTransport({
				"host": global.configuration.SMTP.hôte,
				"port": global.configuration.SMTP.port,
				"secure": global.configuration.SMTP.sécurité,
				"auth": {
					user: global.configuration.SMTP.identifiant,
					pass: global.configuration.SMTP.motDePasse,
				},
			})

			// Envoie un courriel à la personne
			let courriel = await transporteur.sendMail({
				"from": `"${global.configuration.SMTP.nomExpéditeur}" <${global.configuration.SMTP.adresseMélExpéditeur}>`,
				"to": création.adresseMél,
				"subject": global.langues[options.langue].courriel.inscription.sujet,
				"text": global.langues[options.langue].courriel.inscription.contenuTexte(création.nomUtilisateur, création.motDePasse),
				"html": global.langues[options.langue].courriel.inscription.contenuHTML(création.nomUtilisateur, création.motDePasse),
			})
*/
			return { "validé": true, }
		}

		catch (erreur) {
			// Supprime l’objet de recherche créé
			if (création.recherche)
				await Mongoose.model("recherche").findByIdAndDelete(création.recherche)

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

schémaMembre.statics.modifier = async function (nomUtilisateur, champs = {}) {
	const membre = await this.obtenir(nomUtilisateur, [])

	if (membre !== null) {
		await modèleMembre.findByIdAndUpdate(membre._id, champs)
		return true
	}

	else
		return false
}

schémaMembre.statics.modifierGénéral = async function (nomUtilisateur, champsFormulaire, modificationComplète) {
	const membre = await modèleMembre.obtenir(nomUtilisateur),
		modification = {}

	// Récupère les fichiers envoyés dans un objet (et ne garde que le premier fichier de chaque champ car je n’en attend qu’un pour chacun)
	const fichiers = Object.fromEntries(Object.entries(champsFormulaire.fichiers).map(([ clé, valeur, ]) => [ clé, valeur[0], ]))

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatNom.test(champsFormulaire.nomMarital) || champsFormulaire.nomMarital === "", "ERREUR_NOM_MARITAL")

				modification.nomMarital = champsFormulaire.nomMarital || null

				if (modificationComplète) {
					Assert.ok(global.constantes.formatNom.test(champsFormulaire.prénom), "ERREUR_PRÉNOM")
					Assert.ok(global.constantes.formatNom.test(champsFormulaire.nomPatronymique), "ERREUR_NOM_PATRONYMIQUE")

					modification.prénom = champsFormulaire.prénom
					modification.nomPatronymique = champsFormulaire.nomPatronymique

					Assert.ok([ "true", "false", true, false, ].includes(champsFormulaire.civilité), "ERREUR_CIVILITÉ")
					modification.civilité = champsFormulaire.civilité

					modification.dateNaissance = new Date(global.modules.transformerDate(champsFormulaire.dateNaissance))

					Assert.ok(global.modules.validerDate(modification.dateNaissance), "ERREUR_DATE")
					Assert.ok(modification.dateNaissance >= limiteAntérieureNaissance, "ERREUR_DATE")
					Assert.ok(modification.dateNaissance <= limitePostérieureNaissance, "ERREUR_DATE")
				}

				résoudre(true)
			}

			catch (erreur) {
				rejeter(erreur)
			}
		}),
		// Vérifie la validité du format MIME Type des fichiers s’ils existent
		// Définit l’extension de photographie si reçue ou la supprime si demandé
		new Promise(async (résoudre, rejeter) => {
			try {
				if (fichiers) {
					// Comportement fort : si une image est envoyée avec la demande de suppression, la suppression prime
					if (champsFormulaire.suppressionImage) {
						modification.extensionPhotographie = null

						// Supprime l’ancienne photographie si elle existe
						if (membre.photographie.existe) {
							systèmeFichiers.unlinkSync(membre.photographie.adresseRéelle)
						}

						// Et celle reçue
						if (fichiers.photographie) {
							systèmeFichiers.unlinkSync(fichiers.photographie.path)
							delete fichiers.photographie
						}
					}

					else if (fichiers.photographie) {
						Assert.ok(global.constantes.formatsPhotographie.includes(fichiers.photographie.mimetype), "ERREUR_FORMAT")

						modification.extensionPhotographie = global.constantes.extensionsMIMETypes[fichiers.photographie.mimetype]
					}

					// Idem pour le CV
					if (champsFormulaire.suppressionCV) {
						// Supprime l’ancien CV s’il existe
						if (membre.CV.existe)
							systèmeFichiers.unlinkSync(membre.CV.adresseRéelle)

						// Et celui reçu
						if (fichiers.CV) {
							systèmeFichiers.unlinkSync(fichiers.CV.path)
							delete fichiers.CV
						}
					}

					else if (fichiers.CV)
						Assert.ok(global.constantes.formatsCV.includes(fichiers.CV.mimetype), "ERREUR_FORMAT")
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
			// Déplace et renomme le fichier joint reçu dans le dossier des images de membres
			if (fichiers.photographie) {
				// Supprime l’ancienne photographie
				if (membre.photographie.existe)
					systèmeFichiers.unlinkSync(membre.photographie.adresseRéelle)

				systèmeFichiers.renameSync(fichiers.photographie.path, chemin.join(configuration.dossiers.téléversements, "/images/membres", membre.nomUtilisateur + modification.extensionPhotographie))
			}

			// Déplace et renomme le fichier joint reçu dans le dossier des CVs
			if (fichiers.CV) {
				// Supprime l’ancien CV
				if (membre.CV.existe)
					systèmeFichiers.unlinkSync(membre.CV.adresseRéelle)

				systèmeFichiers.renameSync(fichiers.CV.path, chemin.join(configuration.dossiers.téléversements, "/cv", membre.nomUtilisateur + global.constantes.extensionsMIMETypes[fichiers.CV.mimetype]))
			}

			await modèleMembre.findByIdAndUpdate(membre._id, modification)

			return { "validé": true, }
		}

		catch (erreur) {
			// Supprime les fichiers joints reçus s’il existe toujours
			if (fichiers)
				Object.values(fichiers).forEach(fichier => {
					if (systèmeFichiers.existsSync(fichier.path))
						systèmeFichiers.unlinkSync(fichier.path)
				})

			return {
				"validé": false,
				"erreur": "ERREUR_INCONNUE",
			}
		}
	})
	.catch(erreur => {
		// Supprime les fichiers joints reçus s’ils existent toujours
		if (fichiers)
			Object.values(fichiers).forEach(fichier => {
				if (systèmeFichiers.existsSync(fichier.path))
					systèmeFichiers.unlinkSync(fichier.path)
			})

		return {
			"validé": false,
			"erreur": erreur.message,
		}
	})
}

schémaMembre.statics.modifierOrganisation = async function (nomUtilisateur, champsFormulaire, modificationComplète) {
	const membre = await modèleMembre.obtenir(nomUtilisateur),
		modification = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatIntitulé.test(champsFormulaire.posteActuel) || champsFormulaire.posteActuel === "", "ERREUR_POSTE_ACTUEL")

				modification.posteActuel = champsFormulaire.posteActuel || null

				résoudre(true)
			}

			catch (erreur) {
				rejeter(erreur)
			}
		}),
		// Affecte le service
		new Promise(async (résoudre, rejeter) => {
			try {
				// Si les champs sont fournis
				if (champsFormulaire.organisation && champsFormulaire.service) {
					const organisation = await Mongoose.model("organisation").obtenir(champsFormulaire.organisation, [])
					Assert.notStrictEqual(organisation, null, "ERREUR_ORGANISATION_INEXISTANTE")

					const service = await Mongoose.model("service").obtenir(champsFormulaire.service, [])
					Assert.notStrictEqual(service, null, "ERREUR_SERVICE_INEXISTANT")

					// Vérifie que le service correspond à cette organisation
					Assert.strictEqual(organisation._id.toString(), service.organisation.toString(), "ERREUR_ORGANISATION_SERVICE")

					modification.service = champsFormulaire.service
				}

				// Si les champs ne sont pas fournis
				else if (!champsFormulaire.organisation && !champsFormulaire.service)
					modification.service = null

				// Une personne ne peut envoyer une organisation ou un service sans l’autre, les deux champs doivent être simultanément emplis ou vides
				else
					rejeter(false)

				résoudre(true)
			}

			catch (erreur) {
				rejeter(erreur)
			}
		}),
	])
	.then(async (réponses) => {
		try {
			await modèleMembre.findByIdAndUpdate(membre._id, modification)

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

schémaMembre.statics.modifierRecherche = async function (nomUtilisateur, champsFormulaire, modificationComplète) {
	return await Mongoose.model("recherche").modifier(nomUtilisateur, champsFormulaire, modificationComplète)
}

schémaMembre.statics.modifierLiens = async function (nomUtilisateur, champsFormulaire, modificationComplète) {
	const membre = await modèleMembre.obtenir(nomUtilisateur),
		modification = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				Assert.ok(global.constantes.formatLienSite.test(champsFormulaire.lienSitePersonnel) || champsFormulaire.lienSitePersonnel === "", "ERREUR_LIEN_SITE_PERSONNEL")
				Assert.ok(global.constantes.formatLienLinkedIn.test(champsFormulaire.lienLinkedIn) || champsFormulaire.lienLinkedIn === "", "ERREUR_LIEN_LINKEDIN")
				Assert.ok(global.constantes.formatLienPersonneViadeo.test(champsFormulaire.lienViadeo) || champsFormulaire.lienViadeo === "", "ERREUR_LIEN_VIADEO")
				Assert.ok(global.constantes.formatAdresseMél.test(champsFormulaire.adresseMél), "ERREUR_ADRESSE_MÉL")
				Assert.ok(global.constantes.formatNuméroTéléphone.test(champsFormulaire.numéroTéléphone) || champsFormulaire.numéroTéléphone === "", "ERREUR_NUMÉRO_TÉLÉPHONE")

				// Si les champs sont restés vides, leur valeur par défaut sera null
				modification.lienSitePersonnel = champsFormulaire.lienSitePersonnel || null
				modification.lienLinkedIn = champsFormulaire.lienLinkedIn || null
				modification.lienViadeo = champsFormulaire.lienViadeo || null
				modification.adresseMél = champsFormulaire.adresseMél
				modification.numéroTéléphone = champsFormulaire.numéroTéléphone || null

				résoudre(true)
			}

			catch (erreur) {
				rejeter(erreur)
			}
		}),
	])
	.then(async (réponses) => {
		try {
			await modèleMembre.findByIdAndUpdate(membre._id, modification)

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

schémaMembre.statics.modifierFormations = async function (nomUtilisateur, champsFormulaire, modificationComplète) {
	return await Mongoose.model("inscription").créer(nomUtilisateur, champsFormulaire, modificationComplète)
}

schémaMembre.statics.modifierCompte = async function (nomUtilisateur, champsFormulaire, modificationComplète) {
	const membre = await modèleMembre.obtenir(nomUtilisateur),
		modification = {}

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				// Si le mot de passe n’est pas vide (composé de caractères « blancs »)
				if (!global.constantes.formatChaineVide.test(champsFormulaire.motDePasse)) {
					// Vérifie que les deux mots de passe fournis sont identiques et non nuls
					Assert.strictEqual(champsFormulaire.motDePasse, champsFormulaire.confirmationMotDePasse, "ERREUR_MOT_DE_PASSE")

					modification.motDePasse = await BCrypt.hash(champsFormulaire.motDePasse, global.constantes.degréSalage)
				}

				if (modificationComplète) {
					// Si le nom d’utilisateur a changé
					if (champsFormulaire.nomUtilisateur !== membre.nomUtilisateur) {
						Assert.ok(!global.constantes.formatChaineVide.test(champsFormulaire.nomUtilisateur), "ERREUR_NOM_UTILISATEUR")
						Assert.ok(global.constantes.formatNomUtilisateur.test(champsFormulaire.nomUtilisateur), "ERREUR_NOM_UTILISATEUR")

						// Vérifie qu’aucun membre ne correspond au nouveau nom d’utilisateur
						const membreExistant = await this.obtenir(champsFormulaire.nomUtilisateur, [])

						Assert.strictEqual(membreExistant, null, "ERREUR_NOM_UTILISATEUR_EXISTANT")

						modification.nomUtilisateur = champsFormulaire.nomUtilisateur
					 }

					// Vérifie l’existence du statut
					Assert.ok(global.constantes.clésStatuts.includes(champsFormulaire.statut))

					modification.statut = champsFormulaire.statut
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
			// Si le membre a été renommé, déplace les fichiers associés en conséquence
			if (modificationComplète && modification.nomUtilisateur) {
				if (membre.photographie.existe)
					systèmeFichiers.renameSync(membre.photographie.adresseRéelle, chemin.join(configuration.dossiers.téléversements, "/images/membres", modification.nomUtilisateur + membre.extensionPhotographie))

				if (membre.CV.existe)
					systèmeFichiers.renameSync(membre.CV.adresseRéelle, chemin.join(configuration.dossiers.téléversements, "/cv", modification.nomUtilisateur + global.constantes.extensionsMIMETypes[fichiers.CV.mimetype]))
			}

			await modèleMembre.findByIdAndUpdate(membre._id, modification)

			// Indique un changement du nom d’utilisateur pour préparer une redirection URL
			if (modification.nomUtilisateur !== membre.nomUtilisateur)
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

schémaMembre.statics.valider = async function (nomUtilisateur) {
	try {
		await this.modifier(nomUtilisateur, {
			"estValidé": true,
		})

		return true
	}

	catch (erreur) {
		return false
	}
}

schémaMembre.statics.supprimer = async function (nomUtilisateur) {
	try {
		const membre = await this.obtenir(nomUtilisateur, [])

		if (membre !== null) {
			// Supprime la photographie si elle existe
			if (membre.photographie.existe)
				systèmeFichiers.unlinkSync(membre.photographie.adresseRéelle)

			// Supprime sa recherche
			await Mongoose.model("recherche").findByIdAndDelete(membre.recherche)

			// Puis supprime le membre en base de données
			return await this.findByIdAndDelete(membre._id).exec()
		}

		else
			return null
	}

	catch (erreur) {
		return null
	}
}

const modèleMembre = Mongoose.model("membre", schémaMembre)

module.exports = modèleMembre
