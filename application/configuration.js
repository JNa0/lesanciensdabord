
const chemin = require("path")
const dossierApplication = __dirname

module.exports = {
	/*
		@type : booléen (undefined)
		@description : définit l’état de l’environnement de l’application pour gérer les journaux et l’affichage des erreurs
	*/
	"estEnDéveloppement": false,

	/*
		@type : entier (undefined)
			@valeurs : >= 1024 & <= 65535
		@description : définit le numéro de port sur la quelle trouver l’application
	*/
	"port": 3000,

	/*
		@type : fonction (null)
		@description : fonction lancée au démarrage du serveur
	*/
	"démarrage": () => {
		console.log("Initialisation du serveur…")
	},

	/*
		@type : chaine | objet | [ chaine | objet ] (undefined)
		@description : définit les dossiers publics du site
	*/
	"dossiersPublics": [
		"ressources",
		{
			"adresse": "fichiers",
			"dossier": "téléversements",
			// N’autorise l’accès qu’aux personnes qui ont le droit de consulter les fichiers téléversés
			"condition": (requête, réponse, fonctionSuivante) => {
				if (!requête.session.droits.fichiers)
					réponse.status(403).end()

				else
					fonctionSuivante()
			},
		},
	],

	/*
		@type : objet (undefined)*
			@format : nom: cheminSF
		@description : définit les dossiers de l’application
	*/
	"dossiers": {
		"environnement": chemin.join(".", ".."),
		"application": dossierApplication,
		"contrôles": chemin.join(dossierApplication, "contrôles"),
		"contrôleurs": chemin.join(dossierApplication, "contrôleurs"),
		"modèles": chemin.join(dossierApplication, "modèles"),
		"modules": chemin.join(dossierApplication, "modules"),
		"ressources": chemin.join(dossierApplication, "ressources"),
		"téléversements": chemin.join(dossierApplication, "téléversements"),
		"traductions": chemin.join(dossierApplication, "traductions"),
		"vues": chemin.join(dossierApplication, "vues"),
	},

	/*
		@type : objet (undefined)
		@description : définit les fichiers de premier niveau de l’application
	*/
	"fichiers": {
		"intermédiaires": chemin.join(dossierApplication, "intermédiaires.js"),
		"routes": chemin.join(dossierApplication, "routes.js"),
		"constantes": chemin.join(dossierApplication, "constantes.js"),
		"droits": chemin.join(dossierApplication, "droits.js"),
	},

	/*
		@type : objet (undefined)
			@propriétés :
				secret : chaine utilisée comme sel pour le “hash”age (undefined) (nécessaire)
				générerIdentifiantSession : fonction qui génère un identifiant de session (fonction)
				nom : nom du mouchard d’identifiant de session (“connect.sid”)
				chemin : espace de validité de la session sur le domaine (“/”)
				duréeMaximale : durée en millisecondes avant expiration (undefined)
				expireEn : objet date indiquant quand expirera la session (undefined)
					@commentaire : entre en conflit avec la propriété précédente
				uniquementHTTP : ? (true)
				mêmeSite : définit sur la session est valable sur d’autres sites (true | false | "lax" | "none" | "strict")
				sécurisé : définit le passage de mouchards par HTTPS ou non (false | true | auto),
				proxy : faire confiance au proxy en cas de sécurité activée (undefined | false | true)
				sauvegardeContinuelle : indique si les données de session doivent être sauvegardées à chaque requête (true | false)
				mouchardNécessaire : indique si le mouchard d’identification de session doit toujours être envoyé dans la réponse (false | true)
				sauvegardeBrouillon : définit s’il faut sauvegarder une session même quand elle n’est pas initialisée (true | false)
				destruction : définit comment la session est détruite lorsque la référence est perdue (“keep” | “destroy”)
		@description : permet de définir le comportement de la session d’utilisateur
		@détails : il fournit divers outils pour paramétrer la gestion des mouchards générés par le site et leur expiration ; il stocke les données sous MongoDB via Mongoose
		@documentation : https://www.npmjs.com/package/express-session
	*/
	"session": {
		"secret": require("unique-string")(),
		"nom": "IDSession",
		"duréeMaximale": 24 /* heures */ * 60 /* minutes */ * 60 /* secondes */ * 1000 /* millisecondes */,
		"sauvegardeContinuelle": false,
		"sauvegardeBrouillon": false,
	},

	/*
		@type : objet (undefined)
			@format : nomObjetTraduction: branches
				@format de branche : chaine | [ chaine ]
		@description : permet de définir quelles traductions seront chargées pour quelles branches du site
		@détails : ce système permet de définir un simple fichier comme un dossier composé de fichiers comme traduction
	*/
	"traductions": {
		// Charge la traduction “fr”ançaise sur tout le site
		"fr": "/",
	},

	/*
		@type : objet (undefined)
			@format : nomObjetModèle: branches
				@format de branche : chaine | [ chaine ]
		@description : permet de définir quels modèles de bases de données seront chargés pour quelles branches du site
		@détails : ce système permet de définir un simple fichier comme un dossier composé de fichiers comme modèle
	*/
	"modèles": {
		// Charge le modèle “mongoose” (ODM de MongoDB) sur tout le site
		"mongoose": "/",
	},

	/*
		@type : chaine (null)
		@description : définit l’outil de contrôles unitaires à utiliser
	*/
	"outilContrôle": "jasmine",

	/*
		@type : fonction (null)
		@description : fonction lancée pour effectuer les contrôles unitaires au démarrage du serveur (en mode développement uniquement)
	*/
	"contrôler": (outil, dossierContrôles) => {
		console.log("Exécution des contrôles unitaires…")

		const Jasmine = new outil()

		Jasmine.loadConfig({
			// “dossierContrôles” devrait suffire mais Jasmine veut absolument un chemin relatif…
			"spec_dir": "./" + dossierContrôles.split("\\").slice(-2).join("\\"),
			"spec_files": [ "**/*.js", ],
			"helpers": null,
			"stopSpecOnExpectationFailure": false,
			"random": false,
		})

		// Interrompt le serveur en cas d’échec
		Jasmine.onComplete(réussite => réussite || process.exit(1))

		Jasmine.configureDefaultReporter({ "showColors": false, })

		Jasmine.execute()
	},

	/*
		@type : booléen (true)
			@champs : @documentation
		@description : définit s’il faut compresser la réponse ou non (compression GZIP)
		@documentation : https://expressjs.com/en/resources/middleware/compression.html
	*/
	"compressionRéponse": true,

	/*
		@type : chaine ("30s")
			@champs : @documentation
		@description : définit qulle durée attendre avant faire expirer la requête
		@documentation : https://expressjs.com/en/resources/middleware/timeout.html
	*/
	"expirationRequête": "5s",

	/*
		@type : objet ({})
			@champs : @documentation
		@description : définit comment traiter et valider la requête
		@documentation : expressjs.com/en/4x/api.html#express.urlencoded
	*/
	"validationRequête": {
		"limit": "5mb",
		"extended": false,
	},

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
		@type : booléen (false)
		@description : active la protection générale Helmet et CSurf
	*/
	"protection": true,

	/*
		@type : fonction (undefined)
		@description : fonction appelée en cas d’erreur en environnement de production
		@détails : peut être écrasée par des fonctions spécifiques au format “erreur{code}” comme “erreur404” ou “erreur503”
	*/
	// Affiche la page d’erreur en cas d’erreur (quelconque)
	"erreur": (erreur, requête, réponse) => {
		réponse.status(erreur.status || 500)

		réponse.render(chemin.join(dossierApplication, "vues/erreur"), {
			"URL": {
				...requête._parsedUrl,
				"query": requête.query,
				"body": requête.body,
				"params": requête.params,
			},
			"langue": requête.langue,
			"session": requête.session,
			"jetonCSRF": requête.csrfToken(),
			"titre": erreur.status,
			"message": erreur.code || erreur.message,
		})
	},

	/*
		@type : fonction (null)
		@description : fonction intermédiaire pour répondre à la requête automatique vers l’adresse “/favicon.ico”
	*/
	// Répond que le contenu n’existe pas (code 204)
	"favicon": (requête, résultat) => {
		résultat.status(204).end()
	},

	"SMTP": {
		"hôte": "smtp.etudiant.univ-rennes1.fr",
		"port": "415",
		"sécurité": false,
		"identifiant": "IDENTIFIANT",
		"motDePasse": "MOT_DE_PASSE",
		"nomExpéditeur": "ENVOYEUR",
		"adresseMélExpéditeur": "ADRESSE_MÉL@etudiant.univ-rennes1.fr",
	},
}
