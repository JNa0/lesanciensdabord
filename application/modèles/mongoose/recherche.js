
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId

const Assert = require("assert")

// « jà » est un mot d’ancien français signifiant « l’instant présent »
const jà = new Date(),
	limiteAntérieureDébutEmploi = new Date(),
	limitePostérieureDébutEmploi = new Date(),
	limiteAntérieureFinEmploi = new Date(),
	limitePostérieureFinEmploi = new Date()

// La limite antérieure de début d’emploi est de 3 mois antérieure
limiteAntérieureDébutEmploi.setMonth(jà.getMonth() - 3)

// La limite postérieure de début d’emploi est de quinze mois postérieure
limitePostérieureDébutEmploi.setFullYear(jà.getMonth() + 15)

// La limite antérieure de fin d’emploi est d’une semaine postérieure
limiteAntérieureFinEmploi.setMonth(jà.getDate() + 7)

// La limite postérieure de fin d’emploi est de trente mois postérieure
limitePostérieureFinEmploi.setFullYear(jà.getMonth() + 30)

const schémaRecherche = new Schéma({
	"typeEmploi": { "type": String, "default": null, },
	"domaines": [ { "type": String, }, ],
	"duréeEmploi": {
		"type": {
			"quantité": Number,
			"qualité": String, // jours, semaines, mois…
		},
		"default": null,
	},
	"début": { "type": Date, "min": limiteAntérieureDébutEmploi, "max": limitePostérieureDébutEmploi, "default": null, },
	"fin": { "type": Date, "min": limiteAntérieureFinEmploi, "max": limitePostérieureFinEmploi, "default": null, },
}, { "collection": "recherche", })

// Les dates de début et de fin correspondent à la période pour la quelle le membre cherche un emploi et non celles effectivement employées.

schémaRecherche.virtual("membre", {
	"ref": "membre",
	"localField": "_id",
	"foreignField": "recherche",
	"justOne": true,
})

schémaRecherche.statics.obtenir = async function (identifiant, populations = null) {
	try {
		return await this
			.findById(identifiant)
			.populate(populations || "membre")
			.lean({ "virtuals": true, })
			.exec()
	}

	catch (erreur) {
		return null
	}
}

schémaRecherche.statics.lister = async function (filtres = {}, populations = null, paramètres = null) {
	let requête = this
		.find(filtres)
		.populate(populations)

	if (paramètres !== null) {
		requête = requête
			.sort({ "nom": paramètres.ordreTri || "asc", })
			.skip(paramètres.saut || 0)
			.limit(paramètres.limite || undefined)
	}

	requête = requête.lean({ "virtuals": true, })

	return await requête.exec()
}

schémaRecherche.statics.modifier = async function (nomUtilisateur, champsFormulaire, estAdministrateur) {
	const membre = await Mongoose.model("membre").obtenir(nomUtilisateur, []),
		modification = {}

	return Promise.all([
		// Affecte la recherche
		new Promise(async (résoudre, rejeter) => {
			try {
				// Si un type d’emploi est fourni
				if (champsFormulaire.typeEmploi || null) {
					Assert.ok(global.constantes.clésTypesEmploi.includes(champsFormulaire.typeEmploi), "ERREUR_TYPE_EMPLOI")

					modification.typeEmploi = champsFormulaire.typeEmploi

					Assert.ok(global.constantes.formatNombre.test(champsFormulaire.quantitéDurée), "ERREUR_QUANTITÉ_DURÉE")

					const qualitéDurée = champsFormulaire.qualitéDurée
					Assert.ok(global.constantes.clésQualitéDurée.includes(qualitéDurée), "ERREUR_QUALITÉ_DURÉE")

					modification.duréeEmploi = {
						"quantité": parseInt(champsFormulaire.quantitéDurée, 10),
						"qualité": qualitéDurée,
					}

					// Période de recherche d’emploi
					const périodeEmploi = champsFormulaire.périodeEmploi.split(" - ")

					modification.début = new Date(global.modules.transformerDate(périodeEmploi[0]))
					modification.fin = new Date(global.modules.transformerDate(périodeEmploi[1]))

					Assert.ok(global.modules.validerPériode(modification.début, modification.fin), "ERREUR_PÉRIODE")

					// Vérifie que la durée prévue entre dans l’intervalle de recherche
					const duréeEmploi = modification.duréeEmploi.quantité * (global.constantes.duréeJours[modification.duréeEmploi.qualité]),
						finThéorique = new Date(modification.début)

					// Ajoute cette durée à la date de disponibilité initiale de l’offre
					finThéorique.setDate(finThéorique.getDate() + duréeEmploi)

					// Et vérifie que que cette nouvelle date reste inférieure ou égale à la date de fin de recherche d’emploi
					Assert.ok(finThéorique <= modification.fin, "ERREUR_DURÉE_PÉRIODE")

					const domainesReçus = champsFormulaire.domaines.split(",")

					// Filtre les domaines en n’en gardant que ceux réellement définis
					modification.domaines = domainesReçus.filter(domaine => global.constantes.clésDomaines.includes(domaine))

					// Il doit y en avoir au moins un
					Assert.ok(modification.domaines.length !== 0, "ERREUR_DOMAINE_MANQUANT")
				}

				// Ou affecte ses champs à null
				else {
					modification.typeEmploi = null
					modification.domaines = []
					modification.duréeEmploi = null
					modification.début = null
					modification.fin = null
				}

				résoudre(true)
			}

			catch (erreur) {
				rejeter(erreur)
			}
		}),
	])
	.then(async (réponses) => {
		try {
			await Mongoose.model("recherche").findByIdAndUpdate(membre.recherche, modification)

			return { "validé": true, }
		}

		catch (erreur) {
			return {
				"validé": false,
				"erreur": "ERREUR_INCONNUE",
			}
		}
	})
	.catch(erreur => {
		return {
			"validé": false,
			"erreur": erreur.message,
		}
	})
}

const modèleRecherche = Mongoose.model("recherche", schémaRecherche)

module.exports = modèleRecherche
