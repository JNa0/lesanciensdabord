
const Mongoose = require("mongoose")

const construireFiltres = {
	"membre": async function (objetRecherche) {
		let filtres = { "estValidé": true, }

		const expressionRégulière = new RegExp(objetRecherche.recherche, "ui")

		if (objetRecherche.champ && objetRecherche.recherche) {
			if ([ "prénom", "posteActuel" ].includes(objetRecherche.champ))
				filtres[objetRecherche.champ] = expressionRégulière

			else if (objetRecherche.champ === "nom") {
				filtres = { "$or": [ { ...filtres, }, { ...filtres, }, ], }

				filtres["$or"][0]["nomPatronymique"] = expressionRégulière
				filtres["$or"][1]["nomMarital"] = expressionRégulière
			}
		}

		if (objetRecherche.statut) {
			// Ajoute ce filtre sur les sous‐filtres « $or » s’ils existent ou directement sur l’objet de filtres
			(filtres["$or"] ? filtres["$or"] : [ filtres, ]).forEach(filtre => {
				filtre.statut = objetRecherche.statut
			})
		}

		if (objetRecherche.organisation) {
			// Cherche l’organisation correspondant à la recherche et n’en garde que l’identifiant
			const organisation = (await Mongoose.model("organisation").obtenir(objetRecherche.organisation, []))._id

			// Cherche les services associés à cette organisation et n’en garde que les identifiants
			const services = (await Mongoose.model("service").lister({ "organisation": { "$in": organisation, }, }, [])).map(service => service._id);

			(filtres["$or"] ? filtres["$or"] : [ filtres, ]).forEach(filtre => {
				filtre.service = { "$in": services, }
			})
		}

		if (objetRecherche.formation) {
			// Cherche la formation correspondante et n’en garde que l’identifiant
			const formation = (await Mongoose.model("formation").obtenir(objetRecherche.formation, []))._id

			// Cherche les inscriptions correspondantes et n’en garde que les clés étrangères de membres
			const inscriptions = (await Mongoose.model("inscription").lister({ "formation": formation, }, [])).map(inscription => inscription.membre);

			(filtres["$or"] ? filtres["$or"] : [ filtres, ]).forEach(filtre => {
				filtre._id = { "$in": inscriptions, }
			})
		}

		if (objetRecherche.promotion) {
			// Méthode assez couteuse en calcul mais c’est la seule qui me semble fonctionner sainement…
			const membres = (await Mongoose.model("membre").lister(filtres))
				.filter(membre => membre.promotion && membre.promotion.dateSortie === parseInt(objetRecherche.promotion, 10))
				.map(membre => membre._id);

			(filtres["$or"] ? filtres["$or"] : [ filtres, ]).forEach(filtre => {
				if (filtre._id)
					filtre._id["$in"] = filtre._id["$in"].filter(identifiant => membres.includes(identifiant))

				else
					filtre._id = { "$in": membres, }
			})
		}

		return filtres
	},

	"organisation": async function (objetRecherche) {
		let filtres = {}

		if (objetRecherche.champ && objetRecherche.recherche) {
			if ([ "raisonSociale", "villeSiègeSocial", "codePostalSiègeSocial", ].includes(objetRecherche.champ))
				filtres[objetRecherche.champ] = new RegExp(objetRecherche.recherche, "ui")
		}

		if (objetRecherche.secteurActivité)
			filtres.secteurActivité = objetRecherche.secteurActivité

		if (objetRecherche.paysSiègeSocial)
			filtres.paysSiègeSocial = objetRecherche.paysSiègeSocial

		if (objetRecherche.proposeOffres) {
			// Cherche les offres et n’en garde que les services comme clés étrangères
			const services = (await Mongoose.model("offre").lister({}, [])).map(offre => offre.service)

			// Cherche les services et n’en garde que les organisations comme clés étrangères
			const organisations = (await Mongoose.model("service").lister({ "_id": { "$in": services, }, }, [])).map(service => service.organisation)

			filtres._id = { "$in": organisations, }
		}

		return filtres
	},

	"offre": async function (objetRecherche) {
		let filtres = {}
		const expressionRégulière = new RegExp(objetRecherche.recherche, "ui")

		if (objetRecherche.champ && objetRecherche.recherche) {
			if ([ "intitulé", ].includes(objetRecherche.champ))
				filtres[objetRecherche.champ] = expressionRégulière

			if ([ "ville", "codePostal", ].includes(objetRecherche.champ)) {
				const filtresService = {
					[ objetRecherche.champ ]: expressionRégulière,
				}

				const services = (await Mongoose.model("service").lister(filtresService, [])).map(service => service._id)

				filtres.service = { "$in": services, }
			}
		}

		if (objetRecherche.typeEmploi)
			filtres.typeEmploi = objetRecherche.typeEmploi

		if (objetRecherche.organisation) {
			const organisation = (await Mongoose.model("organisation").obtenir(objetRecherche.organisation, []))._id

			const services = (await Mongoose.model("service").lister({ "organisation": { "$in": organisation, }, }, [])).map(service => service._id)

			// Si le filtre sur service est déjà défini, précise le filtrage en refiltrant la liste des identifiants autorisés pour éviter une collision
			// J’utilise .some au lieu de .includes car le premier fait une comparaison relative des objets (instances de ObjectId) à lors que le second fait une comparaison d’égalité stricte
			if (filtres.service)
				filtres.service["$in"] = filtres.service["$in"].filter(idService => services.some(service => service.equals(idService)))

			else
				filtres.service = { "$in": services, }
		}

		if (objetRecherche.pays) {
			const filtresService = {
				"pays": objetRecherche.pays,
			}

			const services = (await Mongoose.model("service").lister(filtresService, [])).map(service => service._id)

			// Si le filtre sur service est déjà défini, précise le filtrage
			if (filtres.service)
				filtres.service["$in"] = filtres.service["$in"].filter(idService => services.some(service => service.equals(idService)))

			else
				filtres.service = { "$in": services, }
		}

		return filtres
	},

	"candidat": async function (objetRecherche) {
		const filtres = { "estValidé": true, }

		const offre = await Mongoose.model("offre").obtenir(objetRecherche.offre, [])

		const filtresRecherche = {
			// Si le type d’emploi de la recherche correspond à celui de l’offre
			"typeEmploi": offre.typeEmploi,
		}

		// Liste puis filtre les recherches d’emploi correspondant
		// Il faudrait plutôt utiliser la clause $where de MongoDB mais elle nécessite que la fonction soit isolée et donc interdit l’accès à la variable offre
		const recherches = (await Mongoose.model("recherche").lister(filtresRecherche))
			// Vérifie qu’au moins un domaine de recherche du membre est partagé avec l’offre
			.filter(recherche => recherche.domaines.some(domaine => offre.domaines.includes(domaine)))
			// Vérifie ensuite la correspondance temporelle
			.filter(recherche => {
				// Calcule la « durée prévue » de l’emploi cherché en jours
				const duréeEmploi = recherche.duréeEmploi.quantité * (global.constantes.duréeJours[recherche.duréeEmploi.qualité]),
					finThéorique = new Date(offre.débutValidité)

				// Ajoute cette durée à la date de disponibilité initiale de l’offre
				finThéorique.setDate(finThéorique.getDate() + duréeEmploi)

				// Et vérifie que que cette nouvelle date reste inférieure ou égale à la fois à la date de disponibilité finale de l’offre et à la date de fin de recherche d’emploi
				return finThéorique <= offre.finValidité && finThéorique <= recherche.fin
			})

		filtres.recherche = { "$in": recherches.map(recherche => recherche._id), }

		return filtres
	},
}

const modèleRecherche = {
	"lister": async function (objetRecherche, type, modèle, numéroPage) {
		const retour = {}

		const recherche = await construireFiltres[type](objetRecherche)

		retour.résultats = await Mongoose.model(modèle).lister(recherche, null, {
			"saut": (numéroPage - 1) * global.constantes.nombreRésultatsParPage,
			"limite": global.constantes.nombreRésultatsParPage,
			"ordreTri": objetRecherche.ordreTri,
		})

		retour.nombreRésultats = await Mongoose.model(modèle).compter(recherche)

		return retour
	},
}

module.exports = modèleRecherche
