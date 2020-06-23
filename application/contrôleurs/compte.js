
module.exports = {
	"connexion": function (requête, réponse) {
		réponse.render("connexion", {
			"URL": requête.url,
		})
	},

	"validerConnexion": function (requête, réponse) {
		réponse.render("connexion", {
			"URL": requête.url,
		})
	},

	"inscription": function (requête, réponse) {
		réponse.render("inscription", {
			"URL": requête.url,
		})
	},
	"inscriptionMembre": function (requête, réponse) {
		réponse.render("inscriptionMembre", {
			"URL": requête.url,
		})
	},
	"inscriptionOrganisation": function (requête, réponse) {
		réponse.render("inscriptionOrganisation", {
			"URL": requête.url,
		})
	},

	"validerInscriptionMembre": function (requête, réponse) {
		/*
		À FAIRE
		*/
		réponse.render("inscription-membre", {
			"URL": requête.url,
		})
	},
	"validerInscriptionOrganisation": function (requête, réponse) {
		/*
		À FAIRE
		*/
		réponse.render("inscription-organisation", {
			"URL": requête.url,
		})
	},
}
