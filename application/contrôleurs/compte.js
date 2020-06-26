
module.exports = {
	"connexion": function (requête, réponse) {
		réponse.render("connexion", {
			"URL": requête.url,
			"langue": réponse.fr,
		})
	},

	"validerConnexion": function (requête, réponse) {
		réponse.render("connexion", {
			"URL": requête.url,
			"langue": réponse.fr,
		})
	},

	"inscription": function (requête, réponse) {
		réponse.render("inscription", {
			"URL": requête.url,
			"langue": réponse.fr,
		})
	},
	"inscriptionMembre": function (requête, réponse) {
		réponse.render("inscriptionMembre", {
			"URL": requête.url,
			"langue": réponse.fr,
		})
	},
	"inscriptionOrganisation": function (requête, réponse) {
		réponse.render("inscriptionOrganisation", {
			"URL": requête.url,
			"langue": réponse.fr,
		})
	},

	"validerInscriptionMembre": function (requête, réponse) {
		/*
		À FAIRE
		*/
		réponse.render("inscription-membre", {
			"URL": requête.url,
			"langue": réponse.fr,
		})
	},
	"validerInscriptionOrganisation": function (requête, réponse) {
		/*
		À FAIRE
		*/
		réponse.render("inscription-organisation", {
			"URL": requête.url,
			"langue": réponse.fr,
		})
	},
}
