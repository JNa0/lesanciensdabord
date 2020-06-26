
module.exports = {
	"obtenir": function (requête, réponse) {
		réponse.render("ficheOrganisation", {
			"URL": requête.url,
			"langue": réponse.fr,
			"id": 625,
			"nomOrganisation": "securvie",
			"rôle": "organisation",
			"raisonSociale": "Securvie",
			"secteurActivité": "Cybersécurité",
			"linkedIn": "linkedin.com/in/securvie",
			"siteProfessionnel": "https://securvie.com",
			"effectif": 45,
			"villes": [
				"Rennes",
				"Lannion",
				"Saint‐Brieuc",
				"Brest",
				"Vannes",
				"Lorient",
				"Dinan",
				"Saint‐Malo",
			],
			"offres": [
				{
					"intitulé": "Ingénieur en cybersécurité",
					"type": "Alternance",
					"ville": "Lannion",
					"codePostal": "22300",
					"identifiantOffre": "34798",
				},
				{
					"intitulé": "Chef de projet",
					"type": "Emploi",
					"ville": "Rennes",
					"codePostal": "35000",
					"identifiantOffre": "29385",
				},
			],
		})
	},
}
