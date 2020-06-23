
const chemin = require("path")

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
		@type : objet (undefined)
		@description : définit les dossiers utilisés par le noyau
	*/
	"dossiers": {
		"vues": "vues",
		"ressources": "ressources",
	},

	/*
		@type : objet (undefined)
		@description : définit les fichiers utilisés par le noyau
	*/
	"fichiers": {
		"intermédiaires": "intermédiaires.js",
		"routes": "routes.js",
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

	/*
		@type : fonction (undefined)
		@description : fonction appelée en cas d’erreur en environnement de production
		@détails : peut être écrasée par des fonctions spécifiques au format “erreur{code}” comme “erreur404”
	*/
	// Affiche la page 404 en cas d’erreur (quelconque)
	"erreur": (erreur, requête, réponse) => {
		réponse.render(chemin.join(__dirname, "./vues/404"))
	},

	/*
		@type : fonction (null)
		@description : fonction intermédiaire pour répondre à la requête vers l’adresse “/favicon.ico”
	*/
	// Répond que le contenu n’existe pas (code 204)
	"favicon": (requête, résultat) => {
		résultat.status(204).end()
	},
}
