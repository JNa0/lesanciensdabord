
/*

	Schéma général des contrôles unitaires :

	Créer un membre

	Obtenir un membre
	Valider un membre

	Lister les membres

	Modifier un membre
		modifier, modifierGénéral, modifierOrganisation, modifierLiens, modifierCompte

	Créer une institution

	Lister les institutions
	Valider une institution

	Créer un établissement

	Lister les établissements
	Obtenir une inscription
	Valider un établissement

	Créer une formation

	Lister les formations
	Obtenir une formation
	Valider une formation

	Créer une inscription

	Lister les inscriptions
	Obtenir une inscription
	Valider une inscription

	Inscrire en DUT
	Valider la pseudopropriété

	Créer une organisation

	Obtenir une organisation
	Valider une organisation
	Modifier une organisation

	Créer un service
	Obtenir un service
	Valider un service
	Modifier un service

	Créer une offre
	Obtenir une offre
	Valider une offre
	Modifier une offre

	Modifier une recherche
	Valider une recherche
	Valider la candidature

	Créer un signalement
	Obtenir un signalement
	Valider un signalement

	Supprimer un signalement

	Supprimer une organisation
	Valider la suppression en cascade (services et offres)

	Supprimer une établissement

	Supprimer une institution

	Supprimer une formation

	Supprimer une inscription

	Supprimer un membre
	Valider la suppression en cascade (recherche)

	Note : validation de création de fichier à implanter
	Note : créer une base de données exclusive aux contrôles est préférable, et il faut alors la vider avant chaque exécution de la batterie de contrôles
	Note : les contrôles ici ne couvrent pas la totalité des points à vérifier, notamment ils ne vérifient pas que l’absence de certains attributs empêche la création -> à faire

*/

	//expect(membreTest2.inscriptions instance Array).toBe(true)
	//expect(membreTest2.inscriptions.length).toBe(0)

const modèlesMongoose = global.modèles.mongoose

const générerAdresseMél = () => `test${Math.round(Math.random() * 10e8)}@test.test`

let membreTest2,
	institution,
	établissement,
	formation,
	inscription,
	organisation,
	service,
	offre

describe("Mongoose : ", () => {
	// Noms d’utilisateur prévus des deux membres qui seront créés
	const nomUtilisateurMembre1 = "testtest"
	const nomUtilisateurMembre2 = "testtest1"
	const nomUtilisateurMembre3 = "test2"

	/****************************************************************
		Créer un membre
	****************************************************************/

	it("créer deux membres", async () => {
		const objetModèleCréationMembre = {
			"statut": "enseignant",
			"prénom": "TEST",
			"nomPatronymique": "TEST",
			"nomMarital": "",
			"dateNaissance": "01/01/2000",
			"civilité": "false",
			// L’adresse mél doit être unique pour les membres donc il faut en générer une aléatoire automatiquement
			"adresseMél": générerAdresseMél(),
			"traitementDonnéesPersonnelles": "true",
			"traitementDonnéesProfessionnelles": "true",
		}

		let créationMembre

		const objetModèleCréationMembreValide = { ...objetModèleCréationMembre, }
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreValide)

		// Premier membre
		expect(créationMembre.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		// Deuxième membre
		objetModèleCréationMembreValide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreValide)

		expect(créationMembre.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationMembrePrénomInvalide = { ...objetModèleCréationMembre, }
		objetModèleCréationMembrePrénomInvalide.prénom = ""
		objetModèleCréationMembrePrénomInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembrePrénomInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_PRÉNOM")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationMembreNomPatronymiqueInvalide = { ...objetModèleCréationMembre, }
		objetModèleCréationMembreNomPatronymiqueInvalide.nomPatronymique = "+−×÷="
		objetModèleCréationMembreNomPatronymiqueInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreNomPatronymiqueInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_NOM_PATRONYMIQUE")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationMembreNomMaritalInvalide = { ...objetModèleCréationMembre, }
		objetModèleCréationMembreNomMaritalInvalide.nomMarital = "123"
		objetModèleCréationMembreNomMaritalInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreNomMaritalInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_NOM_MARITAL")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationMembreCivilitéInvalide = { ...objetModèleCréationMembre, }
		objetModèleCréationMembreCivilitéInvalide.civilité = "abcde"
		objetModèleCréationMembreCivilitéInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreCivilitéInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_CIVILITÉ")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationMembreAdresseMélInvalide = { ...objetModèleCréationMembre, }
		objetModèleCréationMembreAdresseMélInvalide.adresseMél = "n’importe@quoi"
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreAdresseMélInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_ADRESSE_MÉL")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationMembreTraitementDonnéesPersonnellesInvalide = { ...objetModèleCréationMembre, }
		objetModèleCréationMembreTraitementDonnéesPersonnellesInvalide.traitementDonnéesPersonnelles = "lesanciensdabord"
		objetModèleCréationMembreTraitementDonnéesPersonnellesInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreTraitementDonnéesPersonnellesInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_AUTORISATION_TRAITEMENT_DONNÉES_PERSONNELLES")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationMembreStatutInvalide = { ...objetModèleCréationMembre, }
		objetModèleCréationMembreStatutInvalide.statut = "grand schtroumpf"
		objetModèleCréationMembreStatutInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreStatutInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_STATUT")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationMembreAdministrateur = { ...objetModèleCréationMembre, }
		objetModèleCréationMembreAdministrateur.statut = "administrateur"
		objetModèleCréationMembreAdministrateur.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreAdministrateur)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_TYPE_ADMINISTRATEUR")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationMembreDateNaissanceInvalide = { ...objetModèleCréationMembre, }
		objetModèleCréationMembreDateNaissanceInvalide.dateNaissance = "01/00/1990"
		objetModèleCréationMembreDateNaissanceInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreDateNaissanceInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_DATE")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationMembreDateNaissanceInvalide.dateNaissance = "00/01/1990"
		objetModèleCréationMembreDateNaissanceInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreDateNaissanceInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_DATE")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationMembreDateNaissanceInvalide.dateNaissance = "01/01/2200"
		objetModèleCréationMembreDateNaissanceInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreDateNaissanceInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_DATE")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationMembreDateNaissanceInvalide.dateNaissance = "01/01/1800"
		objetModèleCréationMembreDateNaissanceInvalide.adresseMél = générerAdresseMél()
		créationMembre = await modèlesMongoose.membre.créer(objetModèleCréationMembreDateNaissanceInvalide)

		expect(créationMembre.validé).toBe(false)
		expect(créationMembre.erreur).toBe("ERREUR_DATE")
	})

	/****************************************************************
		Obtenir un membre
		Valider un membre
	****************************************************************/

	it ("obtenir un membre et vérifier ses informations", async () => {
		// Sans joindre les dépendances
		membreTest2 = await modèlesMongoose.membre.obtenir(nomUtilisateurMembre2, [])

		// Vérifie l’état de quelques propriétés réelles et virtuelles
		expect(membreTest2).not.toBe(null)
		expect(membreTest2.estValidé).toBe(false)
		expect(membreTest2.prénom).toBe("TEST")
		expect(membreTest2.nomPatronymique).toBe("TEST")
		expect(membreTest2.nomMarital).toBe(null)
		expect(membreTest2.numéroTéléphone).toBe(null)
		expect(membreTest2.posteActuel).toBe(null)
		expect(membreTest2.dateDernièreConnexion).toBe(null)
		expect(membreTest2.extensionPhotographie).toBe(null)
		expect(membreTest2.service).toBe(null)
		expect(membreTest2.recherche).not.toBe(null)
		expect(membreTest2.traitementDonnéesPersonnelles).toBe(true)

		expect(membreTest2.nom).toBe("TEST")
		expect(membreTest2.nomComplet).toBe("TEST TEST")
		expect(membreTest2.photographie.existe).toBe(false)
		expect(membreTest2.CV.existe).toBe(false)
	})

	/****************************************************************
		Lister les membres
	****************************************************************/

	it("lister les membres créés", async () => {
		const membres = await modèlesMongoose.membre.lister({ "prénom": "TEST", }, [])

		expect(membres instanceof Array).toBe(true)
		expect(membres.length).toBe(2)
	})

	/****************************************************************
		Modifier un membre
	****************************************************************/

	it("modifier un membre", async () => {
		const modificationDonnéeMembre = {}
		modificationDonnéeMembre.nomUtilisateur = nomUtilisateurMembre3
		modificationMembre = await modèlesMongoose.membre.modifier(nomUtilisateurMembre2, modificationDonnéeMembre)

		expect(modificationMembre).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		modificationDonnéeMembre.nomUtilisateur = "\(°o°)/"
		modificationMembre = await modèlesMongoose.membre.modifier(nomUtilisateurMembre2, modificationDonnéeMembre)

		expect(modificationMembre).toBe(false)
	})

	// @TODO modifierGénéral, modifierOrganisation, modifierLiens, modifierCompte

	/****************************************************************
		Créer une institution
	****************************************************************/

	it("créer une institution", async () => {
		let créationInstitution

		const objetModèleCréationInstitutionValide = { "nom": "TEST", }
		créationInstitution = await modèlesMongoose.institution.créer(objetModèleCréationInstitutionValide)

		expect(créationInstitution.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationInstitutionNomInvalide = { "nom": "  	  ", }
		créationInstitution = await modèlesMongoose.institution.créer(objetModèleCréationInstitutionNomInvalide)

		expect(créationInstitution.validé).toBe(false)
		expect(créationInstitution.erreur).toBe("ERREUR_NOM")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationInstitutionNomInvalide.nom = "‘+°_°+’"
		créationInstitution = await modèlesMongoose.institution.créer(objetModèleCréationInstitutionNomInvalide)

		expect(créationInstitution.validé).toBe(false)
		expect(créationInstitution.erreur).toBe("ERREUR_NOM")
	})

	/****************************************************************
		Lister les institutions
		Obtenir une institution
		Valider une institution
	****************************************************************/

	it("lister les institutions", async () => {
		const institutions = await modèlesMongoose.institution.lister({ "nom": "TEST", }, [])

		expect(institutions instanceof Array).toBe(true)
		expect(institutions.length).toBe(1)

		institution = await modèlesMongoose.institution.obtenir(institutions[0]._id)

		expect(institution.nom).toBe("TEST")
	})

	/****************************************************************
		Créer un établissement
	****************************************************************/

	it("créer un établissement", async () => {
		const objetModèleCréationÉtablissement = {
			"nom": "TEST",
			"ville": "Testville",
			"codePostal": "12345",
			"pays": "FR",
			"institution": institution._id,
		}

		let créationÉtablissement

		const objetModèleCréationÉtablissementValide = { ...objetModèleCréationÉtablissement, }
		créationÉtablissement = await modèlesMongoose.établissement.créer(objetModèleCréationÉtablissementValide)

		expect(créationÉtablissement.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationÉtablissementNomInvalide = { ...objetModèleCréationÉtablissement, }
		objetModèleCréationÉtablissementNomInvalide.nom = "  	  "
		créationÉtablissement = await modèlesMongoose.établissement.créer(objetModèleCréationÉtablissementNomInvalide)

		expect(créationÉtablissement.validé).toBe(false)
		expect(créationÉtablissement.erreur).toBe("ERREUR_NOM")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationÉtablissementNomInvalide.nom = "‘+°_°+’"
		créationÉtablissement = await modèlesMongoose.établissement.créer(objetModèleCréationÉtablissementNomInvalide)

		expect(créationÉtablissement.validé).toBe(false)
		expect(créationÉtablissement.erreur).toBe("ERREUR_NOM")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationÉtablissementVilleInvalide = { ...objetModèleCréationÉtablissement, }
		objetModèleCréationÉtablissementVilleInvalide.ville = "0123"
		créationÉtablissement = await modèlesMongoose.établissement.créer(objetModèleCréationÉtablissementVilleInvalide)

		expect(créationÉtablissement.validé).toBe(false)
		expect(créationÉtablissement.erreur).toBe("ERREUR_VILLE")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationÉtablissementVilleInvalide.ville = "  	  "
		créationÉtablissement = await modèlesMongoose.établissement.créer(objetModèleCréationÉtablissementVilleInvalide)

		expect(créationÉtablissement.validé).toBe(false)
		expect(créationÉtablissement.erreur).toBe("ERREUR_VILLE")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationÉtablissementCodePostalInvalide = { ...objetModèleCréationÉtablissement, }
		objetModèleCréationÉtablissementCodePostalInvalide.codePostal = ""
		créationÉtablissement = await modèlesMongoose.établissement.créer(objetModèleCréationÉtablissementCodePostalInvalide)

		expect(créationÉtablissement.validé).toBe(false)
		expect(créationÉtablissement.erreur).toBe("ERREUR_CODE_POSTAL")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationÉtablissementPaysInvalide = { ...objetModèleCréationÉtablissement, }
		objetModèleCréationÉtablissementPaysInvalide.pays = "ZZ"
		créationÉtablissement = await modèlesMongoose.établissement.créer(objetModèleCréationÉtablissementPaysInvalide)

		expect(créationÉtablissement.validé).toBe(false)
		expect(créationÉtablissement.erreur).toBe("ERREUR_PAYS")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationÉtablissementInstitutionInvalide = { ...objetModèleCréationÉtablissement, }
		objetModèleCréationÉtablissementInstitutionInvalide.institution += "1"
		créationÉtablissement = await modèlesMongoose.établissement.créer(objetModèleCréationÉtablissementInstitutionInvalide)

		expect(créationÉtablissement.validé).toBe(false)
		expect(créationÉtablissement.erreur).toBe("ERREUR_INSTITUTION_INEXISTANTE")
	})

	/****************************************************************
		Lister les établissements
		Obtenir un établissement
		Valider un établissement
	****************************************************************/

	it("lister les établissements", async () => {
		const établissements = await modèlesMongoose.établissement.lister({ "nom": "TEST", }, [])

		expect(établissements instanceof Array).toBe(true)
		expect(établissements.length).toBe(1)

		établissement = await modèlesMongoose.établissement.obtenir(établissements[0]._id)

		expect(établissement.nom).toBe("TEST")
		expect(établissement.ville).toBe("Testville")
		expect(établissement.codePostal).toBe("12345")
		expect(établissement.pays).toBe("FR")
		expect(établissement.institution.toString()).toBe(institution._id.toString())
	})

	/****************************************************************
		Créer une formation
	****************************************************************/

	it("créer une formation", async () => {
		const objetModèleCréationFormation = {
			"intituléCourt": "TESTA",
			"intituléComplet": "TESTB",
		}

		let créationFormation

		const objetModèleCréationFormationValide = { ...objetModèleCréationFormation, }
		créationFormation = await modèlesMongoose.formation.créer(objetModèleCréationFormationValide)

		expect(créationFormation.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationFormationNomCourtInvalide = { ...objetModèleCréationFormation, }
		objetModèleCréationFormationNomCourtInvalide.intituléCourt = "  	  "
		créationFormation = await modèlesMongoose.formation.créer(objetModèleCréationFormationNomCourtInvalide)

		expect(créationFormation.validé).toBe(false)
		expect(créationFormation.erreur).toBe("ERREUR_INTITULÉ_COURT")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationFormationNomCourtInvalide.intituléCourt = "‘+°_°+’"
		créationFormation = await modèlesMongoose.formation.créer(objetModèleCréationFormationNomCourtInvalide)

		expect(créationFormation.validé).toBe(false)
		expect(créationFormation.erreur).toBe("ERREUR_INTITULÉ_COURT")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationFormationNomCompletInvalide = { ...objetModèleCréationFormation, }
		objetModèleCréationFormationNomCompletInvalide.intituléComplet = "  	  "
		créationFormation = await modèlesMongoose.formation.créer(objetModèleCréationFormationNomCompletInvalide)

		expect(créationFormation.validé).toBe(false)
		expect(créationFormation.erreur).toBe("ERREUR_INTITULÉ_COMPLET")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationFormationNomCompletInvalide.intituléComplet = "‘+°_°+’"
		créationFormation = await modèlesMongoose.formation.créer(objetModèleCréationFormationNomCompletInvalide)

		expect(créationFormation.validé).toBe(false)
		expect(créationFormation.erreur).toBe("ERREUR_INTITULÉ_COMPLET")
	})

	/****************************************************************
		Lister les formations
		Obtenir une formation
		Valider une formation
	****************************************************************/

	it("lister les formations", async () => {
		const formations = await modèlesMongoose.formation.lister({ "intituléComplet": "TESTB", }, [])

		expect(formations instanceof Array).toBe(true)
		expect(formations.length).toBe(1)

		formation = await modèlesMongoose.formation.obtenir(formations[0]._id)

		expect(formation.intituléCourt).toBe("TESTA")
		expect(formation.intituléComplet).toBe("TESTB")
	})

	/****************************************************************
		Créer une inscription
	****************************************************************/

	it("créer une inscription", async () => {
		const objetModèleCréationInscription = {
			"établissement": établissement._id.toString(),
			"formation": formation._id.toString(),
			"périodeFormation": "01/09/2018 - 01/07/2020",
		}

		let créationInscription

		const objetModèleCréationInscriptionValide = { ...objetModèleCréationInscription, }
		créationInscription = await modèlesMongoose.inscription.créer("test2", objetModèleCréationInscriptionValide)

		expect(créationInscription.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationInscriptionMembreInvalide = { ...objetModèleCréationInscription, }
		créationInscription = await modèlesMongoose.inscription.créer("test3", objetModèleCréationInscriptionMembreInvalide)

		expect(créationInscription.validé).toBe(false)
		expect(créationInscription.erreur).toBe("ERREUR_MEMBRE_INEXISTANT")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationInscriptionÉtablissementInvalide = { ...objetModèleCréationInscription, }
		objetModèleCréationInscriptionÉtablissementInvalide.établissement = établissement._id + "1"
		créationInscription = await modèlesMongoose.inscription.créer("test2", objetModèleCréationInscriptionÉtablissementInvalide)

		expect(créationInscription.validé).toBe(false)
		expect(créationInscription.erreur).toBe("ERREUR_ÉTABLISSEMENT_INEXISTANT")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationInscriptionFormationInvalide = { ...objetModèleCréationInscription, }
		objetModèleCréationInscriptionFormationInvalide.formation = formation._id + "1"
		créationInscription = await modèlesMongoose.inscription.créer("test2", objetModèleCréationInscriptionFormationInvalide)

		expect(créationInscription.validé).toBe(false)
		expect(créationInscription.erreur).toBe("ERREUR_FORMATION_INEXISTANTE")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationInscriptionDateEntréeInvalide = { ...objetModèleCréationInscription, }
		objetModèleCréationInscriptionDateEntréeInvalide.périodeFormation = "01/09/1900 - 01/07/2020"
		créationInscription = await modèlesMongoose.inscription.créer("test2", objetModèleCréationInscriptionDateEntréeInvalide)

		expect(créationInscription.validé).toBe(false)
		expect(créationInscription.erreur).toBe("ERREUR_DATE")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationInscriptionDateEntréeInvalide.périodeFormation = "00/09/1900 - 01/07/2020"
		créationInscription = await modèlesMongoose.inscription.créer("test2", objetModèleCréationInscriptionDateEntréeInvalide)

		expect(créationInscription.validé).toBe(false)
		expect(créationInscription.erreur).toBe("ERREUR_PÉRIODE")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationInscriptionDateSortieInvalide = { ...objetModèleCréationInscription, }
		objetModèleCréationInscriptionDateSortieInvalide.périodeFormation = "01/09/1900 - 01/07/2050"
		créationInscription = await modèlesMongoose.inscription.créer("test2", objetModèleCréationInscriptionDateSortieInvalide)

		expect(créationInscription.validé).toBe(false)
		expect(créationInscription.erreur).toBe("ERREUR_DATE")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationInscriptionDateSortieInvalide.périodeFormation = "01/09/1900 - 00/07/2050"
		créationInscription = await modèlesMongoose.inscription.créer("test2", objetModèleCréationInscriptionDateSortieInvalide)

		expect(créationInscription.validé).toBe(false)
		expect(créationInscription.erreur).toBe("ERREUR_PÉRIODE")
	})

	/****************************************************************
		Lister les inscriptions
		Valider une inscription
	****************************************************************/

	it("lister les inscriptions", async () => {
		const inscriptions = await modèlesMongoose.inscription.lister({ "membre": membreTest2._id, }, [])

		expect(inscriptions instanceof Array).toBe(true)
		expect(inscriptions.length).toBe(1)

		inscription = inscriptions[0]

		expect(inscription.membre.toString()).toBe(membreTest2._id.toString())
		expect(inscription.établissement.toString()).toBe(établissement._id.toString())
		expect(inscription.formation.toString()).toBe(formation._id.toString())
		expect(inscription.dateEntrée instanceof Date).toBe(true)
		expect(inscription.dateSortie instanceof Date).toBe(true)
	})

	/****************************************************************
		Inscrire en DUT
		Valider la pseudopropriété
	****************************************************************/

	//@TODO

	/****************************************************************
		Créer une organisation
	****************************************************************/

	it("créer une organisation", async () => {
		const objetModèleCréationOrganisation = {
			"raisonSociale": "TestOrga",
			"villeSiègeSocial": "Lannion",
			"codePostalSiègeSocial": "22300",
			"paysSiègeSocial": "FR",
			"secteurActivité": "tic",
		}

		let créationOrganisation

		const objetModèleCréationOrganisationValide = { ...objetModèleCréationOrganisation, }
		créationOrganisation = await modèlesMongoose.organisation.créer(objetModèleCréationOrganisationValide)

		expect(créationOrganisation.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		let objetModèleCréationOrganisationRaisonSocialeInvalide = { ...objetModèleCréationOrganisation, }
		objetModèleCréationOrganisationRaisonSocialeInvalide.raisonSociale = "( ~°·°~ )"
		créationOrganisation = await modèlesMongoose.organisation.créer(objetModèleCréationOrganisationRaisonSocialeInvalide)

		expect(créationOrganisation.validé).toBe(false)
		expect(créationOrganisation.erreur).toBe("ERREUR_RAISON_SOCIALE")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationOrganisationRaisonSocialeInvalide = { ...objetModèleCréationOrganisation, }
		objetModèleCréationOrganisationRaisonSocialeInvalide.raisonSociale = " 	 "
		créationOrganisation = await modèlesMongoose.organisation.créer(objetModèleCréationOrganisationRaisonSocialeInvalide)

		expect(créationOrganisation.validé).toBe(false)
		expect(créationOrganisation.erreur).toBe("ERREUR_RAISON_SOCIALE")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationOrganisationVilleSiègeSocialInvalide = { ...objetModèleCréationOrganisation, }
		objetModèleCréationOrganisationVilleSiègeSocialInvalide.villeSiègeSocial = "Lannion, 123"
		créationOrganisation = await modèlesMongoose.organisation.créer(objetModèleCréationOrganisationVilleSiègeSocialInvalide)

		expect(créationOrganisation.validé).toBe(false)
		expect(créationOrganisation.erreur).toBe("ERREUR_VILLE")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationOrganisationPaysSiègeSocialInvalide = { ...objetModèleCréationOrganisation, }
		objetModèleCréationOrganisationPaysSiègeSocialInvalide.paysSiègeSocial = "ZZ"
		créationOrganisation = await modèlesMongoose.organisation.créer(objetModèleCréationOrganisationPaysSiègeSocialInvalide)

		expect(créationOrganisation.validé).toBe(false)
		expect(créationOrganisation.erreur).toBe("ERREUR_PAYS")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationOrganisationCodePostalSiègeSocialInvalide = { ...objetModèleCréationOrganisation, }
		objetModèleCréationOrganisationCodePostalSiègeSocialInvalide.codePostalSiègeSocial = "A!00."
		créationOrganisation = await modèlesMongoose.organisation.créer(objetModèleCréationOrganisationCodePostalSiègeSocialInvalide)

		expect(créationOrganisation.validé).toBe(false)
		expect(créationOrganisation.erreur).toBe("ERREUR_CODE_POSTAL")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationOrganisationSecteurActivitéSiègeSocialInvalide = { ...objetModèleCréationOrganisation, }
		objetModèleCréationOrganisationSecteurActivitéSiègeSocialInvalide.secteurActivité = "tic et toc"
		créationOrganisation = await modèlesMongoose.organisation.créer(objetModèleCréationOrganisationSecteurActivitéSiègeSocialInvalide)

		expect(créationOrganisation.validé).toBe(false)
		expect(créationOrganisation.erreur).toBe("ERREUR_SECTEUR_ACTIVITÉ")
	})

	/****************************************************************
		Obtenir une organisation
		Valider une organisation
	****************************************************************/

	it("lister les organisations", async () => {
		const organisations = await modèlesMongoose.organisation.lister({ "raisonSociale": "TestOrga", }, [])

		expect(organisations instanceof Array).toBe(true)
		expect(organisations.length).toBe(1)

		organisation = await modèlesMongoose.organisation.obtenir(organisations[0].nomUtilisateur)

		expect(organisation.nomUtilisateur).toBe("testorga")
		expect(organisation.villeSiègeSocial).toBe("Lannion")
		expect(organisation.codePostalSiègeSocial).toBe("22300")
		expect(organisation.paysSiègeSocial).toBe("FR")
	})

	/****************************************************************
		Modifier une organisation
	****************************************************************/

	// @TODO

	/****************************************************************
		Créer un service
	****************************************************************/

	it("créer un service", async () => {
		const objetModèleCréationService = {
			"nom": "TestService",
			"ville": "Lannion",
			"codePostal": "22300",
			"pays": "FR",
			"organisation": "testorga",
		}

		let créationService

		const objetModèleCréationServiceValide = { ...objetModèleCréationService, }
		créationService = await modèlesMongoose.service.créer(objetModèleCréationServiceValide)

		expect(créationService.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		let objetModèleCréationServiceNomInvalide = { ...objetModèleCréationService, }
		objetModèleCréationServiceNomInvalide.nom = "( ~°·°~ )"
		créationService = await modèlesMongoose.service.créer(objetModèleCréationServiceNomInvalide)

		expect(créationService.validé).toBe(false)
		expect(créationService.erreur).toBe("ERREUR_NOM")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationServiceNomInvalide = { ...objetModèleCréationService, }
		objetModèleCréationServiceNomInvalide.nom = " 	 "
		créationService = await modèlesMongoose.service.créer(objetModèleCréationServiceNomInvalide)

		expect(créationService.validé).toBe(false)
		expect(créationService.erreur).toBe("ERREUR_NOM")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationServiceVilleInvalide = { ...objetModèleCréationService, }
		objetModèleCréationServiceVilleInvalide.ville = "Lannion, 123"
		créationService = await modèlesMongoose.service.créer(objetModèleCréationServiceVilleInvalide)

		expect(créationService.validé).toBe(false)
		expect(créationService.erreur).toBe("ERREUR_VILLE")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationServicePaysInvalide = { ...objetModèleCréationService, }
		objetModèleCréationServicePaysInvalide.pays = "ZZ"
		créationService = await modèlesMongoose.service.créer(objetModèleCréationServicePaysInvalide)

		expect(créationService.validé).toBe(false)
		expect(créationService.erreur).toBe("ERREUR_PAYS")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationServiceCodePostalInvalide = { ...objetModèleCréationService, }
		objetModèleCréationServiceCodePostalInvalide.codePostal = "‹O·O›"
		créationService = await modèlesMongoose.service.créer(objetModèleCréationServiceCodePostalInvalide)

		expect(créationService.validé).toBe(false)
		expect(créationService.erreur).toBe("ERREUR_CODE_POSTAL")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationServiceOrganisationInvalide = { ...objetModèleCréationService, }
		objetModèleCréationServiceOrganisationInvalide.organisation = "orgatest"
		créationService = await modèlesMongoose.service.créer(objetModèleCréationServiceOrganisationInvalide)

		expect(créationService.validé).toBe(false)
		expect(créationService.erreur).toBe("ERREUR_ORGANISATION_INEXISTANTE")
	})

	/****************************************************************
		Obtenir un service
		Valider un service
	****************************************************************/

	it("lister les services", async () => {
		const services = await modèlesMongoose.service.lister({ "nom": "TestService", }, [])

		expect(services instanceof Array).toBe(true)
		expect(services.length).toBe(1)

		expect((await modèlesMongoose.service.lister({ "nom": "ServiceTest", }, [])).length).toBe(0)

		service = await modèlesMongoose.service.obtenir(services[0]._id)

		expect(service.organisation.nomUtilisateur).toBe("testorga")
		expect(service.ville).toBe("Lannion")
		expect(service.codePostal).toBe("22300")
		expect(service.pays).toBe("FR")
	})

	/****************************************************************
		Modifier un service
	****************************************************************/

	//@TODO

	/****************************************************************
		Créer une offre
	****************************************************************/

	it("créer une offre", async () => {
		const objetModèleCréationOffre = {
			"intitulé": "TestOffre",
			"organisation": organisation.nomUtilisateur,
			"service": service._id,
			"typeEmploi": "stage",
			"domaines": "devweb,adminbdd",
			"intervalleValidité": "01/01/2020 - 15/10/2020",
		}

		let créationOffre

		// Définit une organisation pour le membre àfin de valider la création
		membreTest2.service = { organisation, }

		const objetModèleCréationOffreValide = { ...objetModèleCréationOffre, }
		créationOffre = await modèlesMongoose.offre.créer(objetModèleCréationOffreValide, false, { "membre": membreTest2, })

		expect(créationOffre.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		let objetModèleCréationOffreIntituléInvalide = { ...objetModèleCréationOffre, }
		objetModèleCréationOffreIntituléInvalide.intitulé = "( ~°·°~ )"
		créationOffre = await modèlesMongoose.offre.créer(objetModèleCréationOffreIntituléInvalide, false, { "membre": membreTest2, })

		expect(créationOffre.validé).toBe(false)
		expect(créationOffre.erreur).toBe("ERREUR_INTITULÉ")

		/* ———————————————————————————————————————————————————————————————— */

		objetModèleCréationOffreIntituléInvalide = { ...objetModèleCréationOffre, }
		objetModèleCréationOffreIntituléInvalide.intitulé = " 	 "
		créationOffre = await modèlesMongoose.offre.créer(objetModèleCréationOffreIntituléInvalide, false, { "membre": membreTest2, })

		expect(créationOffre.validé).toBe(false)
		expect(créationOffre.erreur).toBe("ERREUR_INTITULÉ")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationOffreServiceInvalide = { ...objetModèleCréationOffre, }
		objetModèleCréationOffreServiceInvalide.service = service._id.toString().split("").reverse().join("")
		créationOffre = await modèlesMongoose.offre.créer(objetModèleCréationOffreServiceInvalide, false, { "membre": membreTest2, })

		expect(créationOffre.validé).toBe(false)
		expect(créationOffre.erreur).toBe("ERREUR_SERVICE_INEXISTANT")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationOffreTypeEmploiInvalide = { ...objetModèleCréationOffre, }
		objetModèleCréationOffreTypeEmploiInvalide.typeEmploi = "erreur"
		créationOffre = await modèlesMongoose.offre.créer(objetModèleCréationOffreTypeEmploiInvalide, false, { "membre": membreTest2, })

		expect(créationOffre.validé).toBe(false)
		expect(créationOffre.erreur).toBe("ERREUR_TYPE_EMPLOI")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationOffreDomainesInvalide = { ...objetModèleCréationOffre, }
		objetModèleCréationOffreDomainesInvalide.domaines = "erreur"
		créationOffre = await modèlesMongoose.offre.créer(objetModèleCréationOffreDomainesInvalide, false, { "membre": membreTest2, })

		expect(créationOffre.validé).toBe(false)
		expect(créationOffre.erreur).toBe("ERREUR_DOMAINE_MANQUANT")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationOffrePériodeValiditéInvalide = { ...objetModèleCréationOffre, }
		objetModèleCréationOffrePériodeValiditéInvalide.intervalleValidité = "00/12/2020 - 31/12/2020"
		créationOffre = await modèlesMongoose.offre.créer(objetModèleCréationOffrePériodeValiditéInvalide)

		expect(créationOffre.validé).toBe(false)
		expect(créationOffre.erreur).toBe("ERREUR_PÉRIODE")
	})

	/****************************************************************
		Obtenir une offre
		Valider une offre
	****************************************************************/

	it("lister les offres", async () => {
		const offres = await modèlesMongoose.offre.lister({ "intitulé": "TestOffre", }, [])

		expect(offres instanceof Array).toBe(true)
		expect(offres.length).toBe(1)

		expect((await modèlesMongoose.offre.lister({ "intitulé": "OffreTest", }, [])).length).toBe(0)

		offre = await modèlesMongoose.offre.obtenir(offres[0]._id)

		expect(offre.service.organisation.nomUtilisateur).toBe("testorga")
		expect(offre.typeEmploi).toBe("stage")
		expect(offre.domaines[0]).toBe("devweb")
		expect((new Date(offre.débutValidité)).toLocaleDateString()).toBe("01/01/2020")
	})

	/****************************************************************
		Modifier une offre
	****************************************************************/

	//@TODO

	/****************************************************************
		Modifier une recherche
		Valider une recherche
		Valider la candidature
	****************************************************************/

	//@TODO

	/****************************************************************
		Créer un signalement
	****************************************************************/

	it("créer un signalement", async () => {
		const objetModèleCréationSignalement = {
			"motif": "TEST",
			"description": "Signalement TEST",
			"adresse": "/nimporte/quelle/page",
		}

		let créationSignalement

		const objetModèleCréationSignalementValide = { ...objetModèleCréationSignalement, }
		créationSignalement = await modèlesMongoose.signalement.créer(objetModèleCréationSignalementValide, membreTest2)

		expect(créationSignalement.validé).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationSignalementDescriptionInvalide = { ...objetModèleCréationSignalement, }
		objetModèleCréationSignalementDescriptionInvalide.description = "  "
		créationSignalement = await modèlesMongoose.signalement.créer(objetModèleCréationSignalementDescriptionInvalide, membreTest2)

		expect(créationSignalement.validé).toBe(false)
		expect(créationSignalement.erreur).toBe("ERREUR_DESCRIPTION")

		/* ———————————————————————————————————————————————————————————————— */

		const objetModèleCréationSignalementAdresseInvalide = { ...objetModèleCréationSignalement, }
		objetModèleCréationSignalementAdresseInvalide.adresse = "  "
		créationSignalement = await modèlesMongoose.signalement.créer(objetModèleCréationSignalementAdresseInvalide, membreTest2)

		expect(créationSignalement.validé).toBe(false)
		expect(créationSignalement.erreur).toBe("ERREUR_ADRESSE")
	})

	/****************************************************************
		Obtenir un signalement
		Valider un signalement
	****************************************************************/

	it("lister les signalements", async () => {
		const signalements = await modèlesMongoose.signalement.lister({ "motif": "TEST", }, [])

		expect(signalements instanceof Array).toBe(true)
		expect(signalements.length).toBe(1)

		signalement = await modèlesMongoose.signalement.obtenir(signalements[0]._id)

		expect(signalement.description).toBe("Signalement TEST")
		expect((new Date(signalement.dateCréation)).getDate() === (new Date()).getDate()).toBe(true)
		expect((new Date(signalement.dateCréation)).getDate() === (new Date()).getDate()).toBe(true)
	})

	/****************************************************************
		Supprimer un signalement
	****************************************************************/

	it("supprimer un signalement", async () => {
		suppressionSignalement = await modèlesMongoose.signalement.supprimer(signalement._id)
		expect(suppressionSignalement).toBe(true)
	})

	/****************************************************************
		Supprimer une organisation
		Valider la suppression en cascade (services et offres)
	****************************************************************/

	it("supprimer une organisation", async () => {
		suppressionOrganisation = await modèlesMongoose.organisation.supprimer(organisation.nomUtilisateur)
		expect(suppressionOrganisation).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		suppressionOrganisation = await modèlesMongoose.organisation.supprimer(organisation.nomUtilisateur.split("").reverse().join(""))
		expect(suppressionOrganisation).toBe(false)

		/* ———————————————————————————————————————————————————————————————— */

		expect((await modèlesMongoose.service.lister({ "nom": "TestService", }, [])).length).toBe(0)

		/* ———————————————————————————————————————————————————————————————— */

		expect((await modèlesMongoose.offre.lister({ "nom": "TestOffre", }, [])).length).toBe(0)
	})

	/****************************************************************
		Supprimer une inscription
	****************************************************************/

	it("supprimer une inscription", async () => {
		suppressionInscription = await modèlesMongoose.inscription.findByIdAndDelete(inscription._id)
		expect(suppressionInscription instanceof Object).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		suppressionInscription = await modèlesMongoose.inscription.findByIdAndDelete(inscription._id.toString().split("").reverse().join(""))
		expect(suppressionInscription).toBe(null)
	})

	/****************************************************************
		Supprimer une formation
	****************************************************************/

	it("supprimer une formation", async () => {
		suppressionFormation = await modèlesMongoose.formation.supprimer(formation._id)
		expect(suppressionFormation instanceof Object).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		suppressionFormation = await modèlesMongoose.formation.supprimer(formation._id + "1")
		expect(suppressionFormation).toBe(null)
	})

	/****************************************************************
		Supprimer un établissement
	****************************************************************/

	it("supprimer un établissement", async () => {
		suppressionÉtablissement = await modèlesMongoose.établissement.supprimer(établissement._id)
		expect(suppressionÉtablissement instanceof Object).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		suppressionÉtablissement = await modèlesMongoose.établissement.supprimer(établissement._id + "1")
		expect(suppressionÉtablissement).toBe(null)
	})

	/****************************************************************
		Supprimer une institution
	****************************************************************/

	it("supprimer une institution", async () => {
		suppressionInstitution = await modèlesMongoose.institution.supprimer(institution._id)
		expect(suppressionInstitution instanceof Object).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		suppressionInstitution = await modèlesMongoose.institution.supprimer(institution._id + "1")
		expect(suppressionInstitution).toBe(null)
	})

	/****************************************************************
		Supprimer un membre
		Valider la suppression en cascade (recherche)
	****************************************************************/

	it("supprimer les deux membres", async () => {
		suppressionMembre = await modèlesMongoose.membre.supprimer(nomUtilisateurMembre1)
		expect(suppressionMembre instanceof Object).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		suppressionMembre = await modèlesMongoose.membre.supprimer(nomUtilisateurMembre2)
		expect(suppressionMembre).toBe(null)

		/* ———————————————————————————————————————————————————————————————— */

		suppressionMembre = await modèlesMongoose.membre.supprimer(nomUtilisateurMembre3)
		expect(suppressionMembre instanceof Object).toBe(true)

		/* ———————————————————————————————————————————————————————————————— */

		rechercheMembre = await modèlesMongoose.recherche.obtenir(suppressionMembre.recherche, [])
		expect(rechercheMembre).toBe(null)
	})
})
