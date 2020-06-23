
module.exports = {
	"obtenir": function (requête, réponse) {
		réponse.render("ficheMembre", {
			"URL": requête.url,
			"id": 3586,
			"nomUtilisateur": "florianmonfort",
			"rôle": "étudiant",
			"nom": "Monfort",
			"nomPatronymique": "Corouge",
			"prénom": "Florian",
			"poste": "Développeur web",
			"établissement": "Securvie",
			"service": {
				"nom": "Section réseaux",
				"ville": "Vannes",
			},
			"linkedIn": "linkedin.com/in/florianmonfort1",
			"viadeo": null,
			"sitePersonnel": "florianmonfort.info/fr",
			"numéroTéléphone": "01 23 45 67 89",
			"adresseMél": "florian.monfort@etudiant.univ-rennes1.fr",
			"recherche": {
				"type_emploi": "alternance",
				"domaines": [
					"cybersécurité",
					"développement web",
				],
				"durée": "9 mois",
				"dateDébut": "30/06/2020",
				"dateFin": "01/09/2020",
			},
			"formations": [
				{
					"intituléCourt": "DUT Informatique",
					"intituléComplet": "Diplôme Universitaire de Technologie en Informatique",
					"établissement": "IUT de Lannion",
					"dateDébut": "2018",
					"dateFin": "2020",
					"ville": "Lannion",
					"codePostal": "22300",
					"institution": "Académie de Rennes 1",
				},
				{
					"intituléCourt": "Baccalauréat S option ISN",
					"intituléComplet": "Baccalauréat Scientifique option Informatique et Sciences du Numérique",
					"établissement": "Lycée E. Freyssinet",
					"dateDébut": "2015",
					"dateFin": "2018",
					"ville": "Saint‐Brieuc",
					"codePostal": "22000",
					"institution": "Éducation Nationale",
				},
			],
		})
	},
}
