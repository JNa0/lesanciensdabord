
/*

	Format d’une route :
		"chemin": {
			"méthode": fonction (requête, réponse, suivant?),
			"méthode": [ fonctions (…) ],
			"sous‐chemin": { sous‐route }
		}

		Méthodes de requête valides :
			"get", "all", "post", put", "delete", "trace", "search", "m-search", "move", "notify", "head", "options", "merge", "purge", "copy", "checkout", ("un")"lock", ("un")"subscribe, "mkactivity", "mkcol"

	Format d’un chemin :
		"/" + chaine de caractères

		Utiliser ([x]) pour échapper le caractère x
		Le symbole . est neutre et le symbole * représente toute suite de caractères
		(x+)? remplace la notation x*
		La notation :libellé (alphanumérique normé) génère une variable de requête
			Le format de la variable peut être précisé entre parenthèse :
				:libellé(format)
				Ex. : :identifiant(\\d+),
					Les expression régulières sont à échapper normalement

*/

const chemin = require("path")
const configuration = require("./configuration")
const chargerModules = require(chemin.join(configuration.dossiers.environnement, "chargerModules.js"))
const contrôleurs = chargerModules(configuration.dossiers.contrôleurs)

module.exports = {
	"/": {
		"get": contrôleurs.accueil.index,
	},
	"/accueil": {
		"get": contrôleurs.accueil.index,
	},
	"/connexion": {
		"get": contrôleurs.compte.connexion,
		"post": contrôleurs.compte.validerConnexion,
	},
	"/inscription": {
		"get": contrôleurs.compte.inscription,
		"/membre": {
			"get": contrôleurs.compte.inscriptionMembre,
			"post": contrôleurs.compte.validerInscriptionMembre,
		},
		"/organisation": {
			"get": contrôleurs.compte.inscriptionOrganisation,
			"post": contrôleurs.compte.validerInscriptionOrganisation,
		},
	},
	"/annuaire": {
		"get": contrôleurs.annuaire.index,
		"/membres": {
			"get": contrôleurs.annuaire.membres,
		},
		"/organisations": {
			"get": contrôleurs.annuaire.organisations,
		},
	},
	"/membre": {
		"/:id(\\d+)": {
			"get": contrôleurs.membre.obtenir,
		},
		"/:id(\\w+)": {
			"get": contrôleurs.membre.obtenir,
		},
	},
	"/organisation": {
		"/:id(\\d+)": {
			"get": contrôleurs.organisation.obtenir,
		},
		"/:id(\\w+)": {
			"get": contrôleurs.organisation.obtenir,
		},
	},
	"/bdd": {
		"/utilisateur": {
			"/creer": {
				"get": contrôleurs.membre_bdd.créer,
				"post": contrôleurs.membre_bdd.créer,
			},
			"/lister": {
				"get": contrôleurs.membre_bdd.lister,
			},
		},
	},
}
