
/*

	Format d’une route :
		"chemin": {
			"méthode": fonction (requête, réponse[, fonctionSuivante]) {…},
			"méthode": [ fonction (…) {…}, … ],
			"sous‐chemin": { sous‐route }
		}

		Méthodes valides :
			"get", "all", "post", put", "delete", "trace", "search", "m-search", "move", "notify", "head", "options", "merge", "purge", "copy", "checkout", ("un")"lock", ("un")"subscribe, "mkactivity", "mkcol"

			Alerte : bien que toutes ces méthodes soient des méthodes HTTP valides, seules GET et POST sont reconnues valides pour un formulaire HTML par la spécification W3C ; étant donnée la préséance de l’interface HTML dans l’usage de l’application, il est déconseillé d’utiliser d’autres méthodes que GET et POST

	Format d’un chemin :
		"/<chemin>"

		Utiliser “([x])” pour échapper le caractère “x”
		Le symbole . est neutre et le symbole * représente toute suite de caractères
		“(x+)?” remplace donc la notation usuelle “x*” (zéro ou plusieurs x)
		La notation “:<libellé”> génère une variable “<libellé>” de requête, le format pouvant être précisé entre parenthèse “:<libellé>(<format>)”
			Ex. : “:identifiant(\\d+)” pour récupérer un identifiant numérique dans l’URL,

	Documentation : expressjs.com/en/guide/routing.html

*/

const chemin = require("path")
const chargerDossier = require("@iutlannion/charger-dossier")

const contrôleurs = chargerDossier(global.configuration.dossiers.contrôleurs)

module.exports = {
	"/": {
		"get": contrôleurs.accueil.index,
	},

	"/accueil": {
		"get": contrôleurs.accueil.index,
	},

	"/connexion": {
		"get": contrôleurs.membre.afficherConnexion,
		"post": contrôleurs.membre.connecter,
	},

	"/déconnexion": {
		"get": contrôleurs.membre.déconnecter,
	},

	"/d%C3%A9connexion": {
		"get": contrôleurs.membre.déconnecter,
	},

	"/inscription": {
		"get": contrôleurs.inscription.afficher,

		"/membre": {
			"get": contrôleurs.membre.afficherInscription,
			"post": contrôleurs.membre.inscrire,
		},

		"/organisation": {
			"get": contrôleurs.organisation.afficherInscription,
			"post": contrôleurs.organisation.inscrire,
		},

		"/service": {
			"get": contrôleurs.service.afficherInscription,
			"post": contrôleurs.service.inscrire,
		},

		"/offre": {
			"get": contrôleurs.offre.afficherInscription,
			"post": contrôleurs.offre.inscrire,
		},

		"/formation": {
			"get": contrôleurs.formation.afficherInscription,
			"post": contrôleurs.formation.inscrire,
		},

		"/etablissement": {
			"get": contrôleurs.établissement.afficherInscription,
			"post": contrôleurs.établissement.inscrire,
		},

		"/%C3%A9tablissement": {
			"get": contrôleurs.établissement.afficherInscription,
			"post": contrôleurs.établissement.inscrire,
		},

		"/institution": {
			"get": contrôleurs.institution.afficherInscription,
			"post": contrôleurs.institution.inscrire,
		},
	},

	"/annuaire": {
		"get": contrôleurs.annuaire.index,

		"/membres": {
			"get": contrôleurs.annuaire.listerMembres,

			"/:page(\\d+)": {
				"get": contrôleurs.annuaire.listerMembres,
			},
		},

		"/organisations": {
			"get": contrôleurs.annuaire.listerOrganisations,

			"/:page(\\d+)": {
				"get": contrôleurs.annuaire.listerOrganisations,
			},
		},
	},

	"/membre": {
		"/:nomUtilisateur": {
			"get": contrôleurs.membre.afficher,

			"/modifier": {
				"get": contrôleurs.membre.afficherModification,

				"/g%C3%A9n%C3%A9ral": {
					"get": contrôleurs.membre.afficherModificationGénéral,
					"post": contrôleurs.membre.modifierGénéral,
				},

				"/organisation": {
					"get": contrôleurs.membre.afficherModificationOrganisation,
					"post": contrôleurs.membre.modifierOrganisation,
				},

				"/recherche": {
					"get": contrôleurs.membre.afficherModificationRecherche,
					"post": contrôleurs.membre.modifierRecherche,
				},

				"/liens": {
					"get": contrôleurs.membre.afficherModificationLiens,
					"post": contrôleurs.membre.modifierLiens,
				},

				"/formations": {
					"get": contrôleurs.membre.afficherModificationFormations,
					"post": contrôleurs.membre.modifierFormations,
				},

				"/compte": {
					"get": contrôleurs.membre.afficherModificationCompte,
					"post": contrôleurs.membre.modifierCompte,
				},
			},

			"/supprimer": {
				"post": contrôleurs.membre.supprimer,
			},
		},
	},

	"/organisation": {
		"/:nomUtilisateur": {
			"get": contrôleurs.organisation.afficher,

			"/modifier": {
				"get": contrôleurs.organisation.afficherModification,

				"/g%C3%A9n%C3%A9ral": {
					"get": contrôleurs.organisation.afficherModificationGénéral,
					"post": contrôleurs.organisation.modifierGénéral,
				},

				"/liens": {
					"get": contrôleurs.organisation.afficherModificationLiens,
					"post": contrôleurs.organisation.modifierLiens,
				},

				"/compte": {
					"get": contrôleurs.organisation.afficherModificationCompte,
					"post": contrôleurs.organisation.modifierCompte,
				},
			},

			"/supprimer": {
				"post": contrôleurs.organisation.supprimer,
			},
		},

		"/service": {
			"/:identifiant": {
				"get": contrôleurs.service.afficher,

				"/modifier": {
					"get": contrôleurs.service.afficherModification,

					"/g%C3%A9n%C3%A9ral": {
						"get": contrôleurs.service.afficherModificationGénéral,
						"post": contrôleurs.service.modifierGénéral,
					},

					"/compte": {
						"get": contrôleurs.service.afficherModificationCompte,
					},
				},

				"/supprimer": {
					"post": contrôleurs.service.supprimer,
				},
			},
		},
	},

	"/offres": {
		"get": contrôleurs.offre.lister,

		"/:page(\\d+)": {
			"get": contrôleurs.offre.lister,
		},
	},

	"/offre": {
		"/:identifiant": {
			"get": contrôleurs.offre.afficher,

			"/candidats": {
				"get": contrôleurs.offre.listerCandidats,

				"/:page(\\d+)": {
					"get": contrôleurs.offre.listerCandidats,
				},
			},

			"/modifier": {
				"get": contrôleurs.offre.afficherModification,

				"/g%C3%A9n%C3%A9ral": {
					"get": contrôleurs.offre.afficherModificationGénéral,
					"post": contrôleurs.offre.modifierGénéral,
				},

				"/compte": {
					"get": contrôleurs.offre.afficherModificationCompte,
				},
			},

			"/supprimer": {
				"post": contrôleurs.offre.supprimer,
			},
		}
	},

	"/signalement": {
		"get": contrôleurs.signalement.afficherInscription,
		"post": contrôleurs.signalement.inscrire,
	},

	"/administration": {
		"get": contrôleurs.administration.accueil,

		"/validerMembre": {
			"post": contrôleurs.administration.validerMembre,
		},

		"/supprimerMembre": {
			"post": contrôleurs.administration.supprimerMembre,
		},

		"/supprimerSignalement": {
			"post": contrôleurs.administration.supprimerSignalement,
		},
	},

	"/remerciements": {
		"get": contrôleurs.accueil.remerciements,
	},

	"/ajax": {
		"/organisations": {
			"get": contrôleurs.ajax.organisations,

			"/:recherche": {
				"get": contrôleurs.ajax.organisations,
			},
		},

		"/organisation/:organisation": {
			"/services": {
				"get": contrôleurs.ajax.servicesOrganisation,

				"/:recherche": {
					"get": contrôleurs.ajax.servicesOrganisation,
				},
			},
		},

		"/formations": {
			"get": contrôleurs.ajax.formations,

			"/:recherche": {
				"get": contrôleurs.ajax.formations,
			},
		},

		"/%C3%A9tablissements": {
			"get": contrôleurs.ajax.établissements,

			"/:recherche": {
				"get": contrôleurs.ajax.établissements,
			},
		},

		"/institutions": {
			"get": contrôleurs.ajax.institutions,

			"/:recherche": {
				"get": contrôleurs.ajax.institutions,
			},
		},
	},
}
