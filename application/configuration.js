
const chemin = require("path")
const dossierApplication = __dirname

module.exports = {
	/*
		@type : booléen (undefined)
		@description : définit l’état de l’environnement de l’application pour gérer les journaux et l’affichage des erreurs
	*/
	"estEnDéveloppement": true,

	/*
		@type : entier (undefined)
			@valeurs : >= 1024 & <= 65535
		@description : définit le numéro de port sur la quelle trouver l’application
	*/
	"port": 3000,

	/*
		@type : chaine (undefined)
		@description : définit le noms du dossier d’accès aux ressources du site
	*/
	"adresseRessources": "ressources",

	/*
		@type : objet (undefined)*
			@format : nom: cheminSF
		@description : définit les dossiers utilisés par le noyau
	*/
	"dossiers": {
		"environnement": chemin.join(".", ".."),
		"application": dossierApplication,
		"contrôleurs": chemin.join(dossierApplication, "contrôleurs"),
		"ressources": chemin.join(dossierApplication, "ressources"),
		"traductions": chemin.join(dossierApplication, "traductions"),
		"vues": chemin.join(dossierApplication, "vues"),
	},

	/*
		@type : objet (undefined)
		@description : définit les fichiers utilisés par le noyau
	*/
	"fichiers": {
		"intermédiaires": chemin.join(dossierApplication, "intermédiaires.js"),
		"routes": chemin.join(dossierApplication, "routes.js"),
	},

	/*
		@type : objet (undefined)
			@format : nomObjetTraduction: brancheSite
		@description : permet de définir quels fichiers de langues seront chargés pour quelles adresses (et sous‐adresses)
		@détails : ce système permet de définir un simple fichier comme un dossier composé de fichiers
	*/
	"langues": {
		// Charge le module “fr”ançais sur tout le site
		"fr": "/",
	},

	/*
		@type : fonction (null)
		@description : fonction lancée au démarrage du serveur
	*/
	"démarrage": () => {
		console.log("Initialisation du serveur…")
	},

	/*
		@type : objet ({})
			@champs : @documentation
		@description : 
		@documentation : expressjs.com/en/4x/api.html#express.urlencoded
	*/
	"validationRequête": { "extended": false },

	/*
		@type : booléen (false)
		@description : définit la sensibilité à la casse dans la définition des routes
	*/
	"sensibilitéCasseRoutes": false,

	/*
		@type : booléen (false)
		@description : définit la sensibilité aux barres obliques finales dans la définition des routes
	*/
	"routageStrict": false,

	/*
		@type : booléen (false)
		@description : définit si les mouchards (cookies) doivent être analysés et ajoutés dans l’objet requête ou non
	*/
	"analyserMouchards": true,

	/*
		@type : chaine (undefined)
			@valeurs : “ejs”, “nunjucks”, “pug”, “twig”, “jade”, “consolidate”, “hbs”, “hogan”…
		@description : définit le moteur de rendu qui sera utilisé
		@détails : il faut installer le module NPM associé
	*/
	"moteurRendu": "ejs",

	/*
		@type : fonction (undefined)
		@description : définit la fonction de rappel du moteur de rendu si vous créez le vôtre
		@documentation : http://expressjs.com/en/advanced/developing-template-engines.html
	*/
	"fonctionRappelMoteurRendu": null,

	/*
		@type : booléen (false)
		@description : active la protection générale Helmet
	*/
	"protection": true,

	/*
		@type : [ objet ] ([])
			@champs :
				adresse : chaine (undefined)
					@valeurs : format URL
					@description : adresse de l’hôte virtuel
				intermédiaire : fonction
		@description : crée des hôtes virtuels
	*/
	"hôtesVirtuels": null,
	// Ce paramètre n’est pas pris en compte pour le moment

	/*
		@type : fonction (undefined)
		@description : fonction appelée en cas d’erreur en environnement de production
		@détails : peut être écrasée par des fonctions spécifiques au format “erreur{code}” comme “erreur404” ou “erreur503”
	*/
	// Affiche la page 404 en cas d’erreur (quelconque)
	"erreur": (erreur, requête, réponse) => {
		réponse.render(chemin.join(__dirname, "./vues/404"))
	},

	/*
		@type : fonction (null)
		@description : fonction intermédiaire pour répondre à la requête automatique vers l’adresse “/favicon.ico”
	*/
	// Répond que le contenu n’existe pas (code 204)
	"favicon": (requête, résultat) => {
		résultat.status(204).end()
	},
}
