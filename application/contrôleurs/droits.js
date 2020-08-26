
const vérifierSoi = (session, options) => session.estConnecté && session.membre._id.toString() === options.instance._id.toString()

const vérifierSien = function (session, options) {
	if (!session.estConnecté || session.membre.service === null)
		return false

	if (options.type === "organisation")
		return session.estConnecté && options.instance.nomUtilisateur === session.membre.service.organisation.nomUtilisateur

	else if (options.type === "service")
		return session.estConnecté && options.instance._id.toString() === session.membre.service._id.toString()

	else if (options.type === "offre")
		return session.estConnecté && options.instance.service.toString() === session.membre.service._id.toString()

	else
		return false
}

const estInscriptionComplète = function (session, options) {
	return session.droits.inscriptionComplèteFiche
}

const estModificationComplète = function (session, options) {
	if (options.type === "membre") {
		if (vérifierSoi(session, options))
			return session.droits.modificationComplèteSoi

		else
			return session.droits.modificationComplèteMembre
	}

	else if (vérifierSien(session, options))
		return session.droits.modificationComplèteSien || session.droits.modificationComplèteFiche

	else
		return session.droits.modificationComplèteFiche
}

const vérifierInscription = function (session, options) {
	if (options.type === "membre")
		return session.droits.inscriptionMembre

	else
		return session.droits.inscriptionComplèteFiche || session.droits.inscriptionFiche
}

const vérifierModification = function (session, options) {
	if (options.instance === null)
		return session.droits.modificationComplèteFiche || session.droits.modificationPartielleFiche

	if (options.type === "membre") {
		if (vérifierSoi(session, options))
			return session.droits.modificationComplèteSoi || session.droits.modificationPartielleSoi

		else
			return session.droits.modificationComplèteMembre || session.droits.modificationPartielleMembre
	}

	else if (vérifierSien(session, options))
		return session.droits.modificationComplèteSien || session.droits.modificationPartielleSien

	else
		return session.droits.modificationComplèteFiche || session.droits.modificationPartielleFiche
}

const vérifierSuppression = function (session, options) {
	if (options.instance === null)
		return session.droits.suppressionFiche

	if (options.type === "membre") {
		if (vérifierSoi(session, options))
			return session.droits.suppressionSoi

		else
			return session.droits.suppressionMembre
	}

	else if (vérifierSien(session, options))
		return session.droits.suppressionSien

	else
		return session.droits.suppressionFiche
}

const vérifierListeCandidats = function (session, options) {
	return session.droits.listeCandidats || (session.droits.listeCandidatsSien && vérifierSien(session, {
		...options,
		"type": "offre",
	}))
}

const vérifier = function (session, droitDemandé, options) {
	if ([
			"connexion",
			"déconnexion",
			"fiche",
			"annuaire",
			"catalogueOffres",
			"fichiers",
			"AJAX",
			"forums",
			"administration",
		]
		.includes(droitDemandé)
	)
		return session.droits[droitDemandé]

	else if (droitDemandé === "inscription")
		return vérifierInscription(session, options)

	else if (droitDemandé === "modification")
		return vérifierModification(session, options)

	else if (droitDemandé === "suppression")
		return vérifierSuppression(session, options)

	else if (droitDemandé === "listeCandidats")
		return vérifierListeCandidats(session, options)

	else
		return null
}

module.exports = {
	estInscriptionComplète,
	estModificationComplète,
	vérifier,
}
