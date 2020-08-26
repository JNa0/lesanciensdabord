#!/usr/bin/env node

// Charge les dépendances principales
const chemin = require("path")
const chargerDossier = require("@iutlannion/charger-dossier")

const dossierEnvironnement = __dirname
const dossierApplication = chemin.join(__dirname, "./application")

// Charge la configuration de l’application
const configuration = Object.freeze(require(chemin.join(dossierApplication, "configuration.js")))
global.configuration = configuration

// Charge les constantes de l’application
global.constantes = Object.freeze(require(configuration.fichiers.constantes))

// Charge Express
const Express = require("express")
const application = Express()

// Définit la durée avant expiration de la requête
application.use(require("connect-timeout")(configuration.expirationRequête || "30s"))
// Fonction de rafraichissement pour contrôler que la requête a expiré
const arrêterSiExpiration = (requête, réponse, fonctionSuivante) => {
	if (!requête.timedout)
		fonctionSuivante()
}

// Définit l’environnement de l’application côté Express
application.set("env", configuration.estEnDéveloppement ? "development" : "production")

// Définit la sensibilité à la casse dans la définition des routes
application.set("case sensitive routing", configuration.sensibilitéCasseRoutes || false)

// Définit la sensibilité aux barres obliques finales dans la définition des routes
application.set("strict routing", configuration.routageStrict || false)

// Définit le dossier où trouver les vues
application.set("views", configuration.dossiers.vues)

// Définit le moteur de génération de vues
application.set("view engine", configuration.moteurRendu)

/*
	Définit les fonctions intermédiaires
*/
// Affiche dans la console des messages d’information sur les requêtes reçues, en mode développement
if (configuration.estEnDéveloppement)
	application.use(require("morgan")("dev"))

// Termine si la requête a expiré
application.use(arrêterSiExpiration)

// Convertit l’adresse en objet JavaScript
application.use(Express.json())

// Définit la méthode de validation des requêtes
application.use(Express.urlencoded(configuration.validationRequête || {}))

// Ajoute les mouchards à la requête
if (configuration.analyserMouchards || false)
	application.use(require("cookie-parser")())

// Indique qu’il faudra compresser les réponses
if (configuration.compressionRéponse ?? true)
	application.use(require("compression")())

application.use(arrêterSiExpiration)

// Charge les droits
global.droits = require(configuration.fichiers.droits)

// Charge les modules
global.modules = chargerDossier(configuration.dossiers.modules)

// Charge les traductions
const traductions = chargerDossier(configuration.dossiers.traductions)
global.langues = {}

// Pour chaque traduction disponible sur le site
Object.entries(configuration.traductions).forEach(([ langue, adresses ]) => {
	if (typeof adresses === "string")
		adresses = [ adresses ]

	// Enregistre la traduction au niveau global
	global.langues[langue] = traductions[langue]

	// Puis pour chacune des adresses aux quelles elle est associée
	adresses.forEach(adresse => {
		// Inscrit cette traduction dans l’objet requête reçu
		application.use(adresse, (requête, réponse, fonctionSuivante) => {
			requête["langue"] = global.langues[langue]
			fonctionSuivante()
		})
	})
})

// Charge les modèles
const modèles = chargerDossier(configuration.dossiers.modèles)
global.modèles = {}

// Pour chaque modèle disponible sur le site
Object.entries(configuration.modèles).forEach(([ modèle, adresses ]) => {
	if (typeof adresses === "string")
		adresses = [ adresses ]

	// Enregistre le modèle au niveau global
	global.modèles[modèle] = modèles[modèle]

	// Puis pour chacune des adresses aux quelles il est associé
	adresses.forEach(adresse => {
		// Inscrit ce modèle dans l’objet requête reçu
		application.use(adresse, (requête, réponse, fonctionSuivante) => {
			requête["modèle"] = global.modèles[modèle]
			fonctionSuivante()
		})
	})
})

// Initialise la session
const Session = require("express-session")
const MongoStore = require("connect-mongo")(Session)

// Ajoute un gestionnaire de sessions d’utilisateur
application.use(Session({
	"secret": configuration.session.secret,
	"name": configuration.session.nom || undefined,
	"store": new MongoStore({ "mongooseConnection": global.modèles.mongoose.connexion, }),
	"genid": configuration.session.générerIdentifiantSession || undefined,
	"proxy": configuration.session.proxy || undefined,
	"resave": configuration.session.sauvegardeContinuelle || false,
	"rolling": configuration.session.mouchardNécessaire || false,
	"saveUninitialized": configuration.session.sauvegardeBrouillon || true,
	"unset": configuration.session.destruction || undefined,
	"cookie": {
		"path": configuration.session.chemin || "/",
		"expireEn": configuration.session.expireEn || undefined,
		"maxAge": configuration.session.duréeMaximale || undefined,
		"httpOnly": configuration.session.uniquementHTTP ?? true,
		"sameSite": configuration.session.sécurisé || "lax",
	},
}))

// Ajouter une surcouche de sécurité (après l’initialisation des traductions pour pouvoir s’en servir dans l’affichage des erreurs)
if (configuration.protection || false) {
	application.use(require("helmet")())

	application.use(require("csurf")())
}

// Charge les fonctions intermédiaires de l’application
require(configuration.fichiers.intermédiaires).forEach(intermédiaire => {
	application.use(intermédiaire)
})

// Définit les chemins statiques (nécessitant la mise en place des modèles, de la session et des droits)
if (configuration.dossiersPublics) {
	if (! configuration.dossiersPublics instanceof Array)
		configuration.dossiersPublics = [ configuration.dossiersPublics ]

	configuration.dossiersPublics.forEach(dossierPublic => {
		if (typeof dossierPublic === "string")
			application.use("/" + dossierPublic, Express.static(configuration.dossiers[dossierPublic]))

		// Si une fonction condition existe, elle sera appelée, si non, passe à la fonction suivante
		else if (dossierPublic instanceof Object)
			application.use("/" + dossierPublic.adresse, dossierPublic.condition || ((requête, réponse, fonctionSuivante) => fonctionSuivante()), Express.static(configuration.dossiers[dossierPublic.dossier]))

		else
			throw new TypeError()
	})
}

if (configuration.estEnDéveloppement)
	console.log("Routes :");

// Charge les routes de l’application
(function charger (objet, routeParente = "") {
	for (let clé in objet) {
		if (typeof objet[clé] === "object")
			charger(objet[clé], routeParente + clé)

		else if (typeof objet[clé] === "function") {
			application[clé](routeParente, objet[clé])

			// Messages sur les routes définies
			if (configuration.estEnDéveloppement)
				console.log(`	${clé} -> ${routeParente}`)
		}
	}
})(require(configuration.fichiers.routes))

if (configuration.estEnDéveloppement)
	console.log("\n")

// Lancem les contrôles unitaires
if (configuration.estEnDéveloppement)
	if (configuration.outilContrôle)
		configuration.contrôler(require(configuration.outilContrôle), configuration.dossiers.contrôles)

if (configuration.estEnDéveloppement)
	console.log("\n")

// Gère le cas particulier du chargement automatique de l’icône de favori du site
application.get("/favicon.ico", configuration.favicon || null)

// Si une route arrive jusqu’ici, génère une erreur 404 car elle n’a pas été distribuée ou n’a pas été terminée
application.use((requête, résultat, fonctionSuivante) => {
	fonctionSuivante(require("http-errors")(404))
})

// Gestionnaire d’erreurs
application.use((erreur, requête, réponse, fonctionSuivante) => {
	// En mode développement, charge la page d’erreur informative
	if (configuration.estEnDéveloppement) {
		// Génère la page d’erreur
		console.error("\n" + erreur.stack + "\n")

		réponse.status(erreur.status || 500)

		réponse.render("erreurDéveloppement", {
			"titre": erreur.status,
			"message": erreur.message,
			"erreur": erreur,
		})
	}

	// En mode production, appelle la fonction de gestion d’erreur indiquée dans la configuration
	else
		// Cherche une fonction associée au code d’erreur (format “erreur{code}”) ou la fonction “erreur” par défaut
		(configuration["erreur" + erreur.status] || configuration.erreur)(erreur, requête, réponse)
})

// Définit le port d’écoute du serveur
application.set("port", configuration.port)

const HTTP = require("http")

// Crée le serveur HTTP à partir de l’application
const serveur = HTTP.createServer(application)

	// Écoute sur toutes les interfaces du port demandé
	.listen(configuration.port, configuration.démarrage)

	// Écoute les évènements d’erreur du serveur HTTP
	.on("error", erreur => {
		if (erreur.syscall !== "listen")
			throw erreur

		const voie = (typeof port === "string" ? "Le canal " : "Le port ") + configuration.port

		switch (erreur.code) {
			case "EACCES":
				console.error(voie + " recquiert des privilèges.")
				process.exit(1)
			break

			case "EADDRINUSE":
				console.error(voie + " est déjà en cours d’utilisation.")
				process.exit(1)
			break

			default:
				throw erreur
		}
	})

// En cas d’exception du serveur, termine fin proprement à l’application
const déconnecter = () => {
	console.log("Signal de terminaison reçu. L’application va s’arrêter.")

	serveur.close(() => console.log("L’application s’est arrêtée."))
}

process.on("exit", déconnecter)
process.on("SIGINT", déconnecter)
process.on("SIGTERM", déconnecter)
