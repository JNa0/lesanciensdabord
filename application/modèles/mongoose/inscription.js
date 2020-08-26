
const Mongoose = require("mongoose")
const Schéma = Mongoose.Schema
const ObjectId = Schéma.Types.ObjectId

const Assert = require("assert")

// « jà » est un mot d’ancien français signifiant « l’instant présent »
const jà = new Date(),
	limiteAntérieureInscription = new Date(),
	limitePostérieureInscription = new Date()

// Les limites dans les quelles on considère qu’une personne peut être née
limiteAntérieureInscription.setYear(jà.getFullYear() - 80)
limitePostérieureInscription.setYear(jà.getFullYear() + 5)

const schémaInscription = new Schéma({
	"membre": { "type": ObjectId, "ref": "membre", },
	"établissement": { "type": ObjectId, "ref": "établissement", },
	"formation": { "type": ObjectId, "ref": "formation", },
	"dateEntrée": { "type": Date, "min": limiteAntérieureInscription, "max": limitePostérieureInscription, "required": true, },
	"dateSortie": { "type": Date, "min": limiteAntérieureInscription, "max": limitePostérieureInscription, "required": true, },
}, { "collection": "inscription", })

schémaInscription.statics.lister = async function (filtres, populations = null) {
	return await this
		.find(filtres)
		.populate(populations || [
			{ "path": "formation", },
			{
				"path": "établissement",
				"populate": { "path": "institution", },
			},
		])
		.lean()
		.exec()
}

schémaInscription.statics.créer = async function (nomUtilisateur, champsFormulaire, estAdministrateur) {
	const membre = await Mongoose.model("membre").obtenir(nomUtilisateur, [])

	if (membre === null)
		return {
			"validé": false,
			"erreur": "ERREUR_MEMBRE_INEXISTANT",
		}

	let inscriptions

	// S’il n’y a qu’une formation envoyée, considère qu’il n’y a aussi qu’un établissement et une période et les assemble en formation
	if (typeof champsFormulaire.formation === "string")
		inscriptions = [
			{
				"formation": champsFormulaire.formation,
				"établissement": champsFormulaire.établissement,
				"période": champsFormulaire.périodeFormation,
				"membre": membre._id.toString(),
			},
		]

	// Si non, assemble les informations reçues en formations par leur indice
	else
		inscriptions = champsFormulaire.formation.map((formation, indice) => {
			return {
				"formation": formation,
				"établissement": champsFormulaire.établissement[indice],
				"période": champsFormulaire.périodeFormation[indice],
				"membre": membre._id.toString(),
			}
		})

	return Promise.all([
		// Vérifie la validité des champs
		new Promise (async (résoudre, rejeter) => {
			try {
				for (inscription of inscriptions) {
					// Vérifie l’existence de cette formation
					const formation = await Mongoose.model("formation").obtenir(inscription.formation)
					Assert.notStrictEqual(formation, null, "ERREUR_FORMATION_INEXISTANTE")

					// Vérifie l’existence de cet établissement
					const établissement = await Mongoose.model("établissement").obtenir(inscription.établissement)
					Assert.notStrictEqual(établissement, null, "ERREUR_ÉTABLISSEMENT_INEXISTANT")

					let période = inscription.période.split(" - ")
					inscription.dateEntrée = new Date(global.modules.transformerDate(période[0]))
					inscription.dateSortie = new Date(global.modules.transformerDate(période[1]))

					Assert.ok(global.modules.validerPériode(inscription.dateEntrée, inscription.dateSortie), "ERREUR_PÉRIODE")
					Assert.ok(inscription.dateEntrée >= limiteAntérieureInscription, "ERREUR_DATE")
					Assert.ok(inscription.dateSortie <= limitePostérieureInscription, "ERREUR_DATE")
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
			/*
				En raison de la difficulté à implanter une contrainte forte sur l’unicité de la relation membre -> formation, j’ai supposé qu’un membre peut indiquer avoir effectué plusieurs fois la même formation
				En conséquence, je n’ai pas de clé primaire sur la quelle me baser pour pouvoir faire une mise à jour des documents de la collection donc je suis contraint à les supprimer et à les recréer
				Une solution possible serait d’envoyer la clé _id dans le formulaire en l’ajoutant comme champ secret de la vue mais obligeant à une vérification supplémentaire
			*/
			await this.deleteMany({ "membre": membre._id.toString(), })
			await this.insertMany(inscriptions)

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

const modèleInscription = Mongoose.model("inscription", schémaInscription)

module.exports = modèleInscription
