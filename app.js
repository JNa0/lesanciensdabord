#!/usr/bin/env node

// Charge les dépendances (modules)
const chemin = require("path")
const HTTP = require("http")

const dossierEnvironnement = __dirname
const dossierApplication = chemin.join(__dirname, "./application")

// Charge le chargeur de modules
const chargerModules = require(chemin.join(dossierEnvironnement, "chargerModules.js"))

// Charge la configuration de l’application
const configuration = require(chemin.join(dossierApplication, "configuration.js"))

// Charge Express
const express = require("./node_modules/express")
const application = express()

// Définit l’environnement de l’application côté Express
application.set("env", configuration.estEnDéveloppement ? "development" : "production")

// Définit la sensibilité à la casse dans la définition des routes
application.set("case sensitive routing", configuration.sensibilitéCasseRoutes || false)
// Définit la sensibilité aux barres obliques finales dans la définition des routes
application.set("strict routing", configuration.routageStrict || false)

// Définit le dossier où trouver les vues
application.set("views", configuration.dossiers.vues)

// Définit la fonction de rappel du moteur de rendu (si propre à l’application)
if (configuration.fonctionRappelMoteurRendu)
	application.engine(configuration.moteurRendu, configuration.fonctionRappelMoteurRendu)

// Définit le moteur de génération de vues
application.set("view engine", configuration.moteurRendu)

/*
	Définit les chemins statiques
*/
// Chemin vers les ressources du site
if (configuration.adresseRessources)
	application.use("/" + configuration.adresseRessources, express.static(configuration.dossiers.ressources))

/*
	Définit les fonctions intermédiaires
*/
// Afficher des messages d’information dans la console en mode développement
if (configuration.estEnDéveloppement)
	application.use(require("./node_modules/morgan")("dev"))

// Ajouter les mouchards à la requête
if (configuration.protection || false)
	application.use(require("./node_modules/helmet")())

// Convertir la requête en objet JavaScript
application.use(express.json())

// Définir la méthode de vérification des requêtes
application.use(express.urlencoded(configuration.validationRequête || {}))

// Ajouter les mouchards à la requête
if (configuration.analyserMouchards || false)
	application.use(require("./node_modules/cookie-parser")())

/*
const créerHôtesVirtuels = require("vhost");
(configuration.hôtesVirtuels || []).forEach(hôteVirtuel => {
	application.use(créerHôtesVirtuels(hôteVirtuel.adresse, hôteVirtuel.intermédiaire))
})
*/

// Charge les fonctions intermédiaires de l’application
require(configuration.fichiers.intermédiaires).forEach(intermédiaire => {
	application.use(intermédiaire)
})

// Charge les traductions
const traductions = chargerModules(configuration.dossiers.traductions)
Object.entries(configuration.langues).forEach(([ langue, adresse ]) => {
	application.use(adresse, function (requête, réponse, fonctionSuivante) {
		réponse[langue] = traductions[langue]
		fonctionSuivante()
	})
})


if (configuration.estEnDéveloppement)
	console.log("Routes :");

// Charge les routes de l’application
(function _ (objet, routeParente = "") {
	for (let clé in objet) {
		if (typeof objet[clé] === "object")
			_(objet[clé], routeParente + clé)

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

// Gére le cas particulier du chargement automatique de l’icône de favori du site
application.get("/favicon.ico", configuration.favicon || null)

// Capture une erreur 404 et la partage au gestionnaire d’erreurs
application.use((requête, résultat, fonctionSuivante) => {
	fonctionSuivante(require("./node_modules/http-errors")(404))
})

// Gestionnaire d’erreurs
application.use((erreur, requête, réponse, fonctionSuivante) => {
	// en mode développement, charge la page d’erreur informative en cas d’erreur
	if (configuration.estEnDéveloppement) {
		// Définit les variables locales, et les erreurs uniquement en mode développement
		réponse.locals.message = erreur.message
		réponse.locals.erreur = erreur

		// Génère la page d’erreur
		console.error("\n" + erreur.stack + "\n")
		réponse.status(erreur.status || 500)
		réponse.render("erreur")
	}

	// En mode production, appelle la fonction de gestion d’erreur indiquée dans la configuration
	else
		// Cherche dans la configuration une fonction correspondant au code d’erreur (format “erreur{code}”) ou prend la fonction “erreur” par défaut
		(configuration["erreur" + erreur.status] || configuration.erreur)(erreur, requête, réponse)
})

// Définit le port d’écoute du serveur
application.set("port", configuration.port)

// Créer le serveur HTTP à partir de l’application
HTTP.createServer(application)

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
