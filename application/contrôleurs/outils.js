
const générerErreur = require("http-errors")

const routeParDéfaut = "/accueil"
const droits = require("./droits")

const rendre = async function (requête, réponse, vue, options, paramètres = {}) {
	// La base URL est la même URL remontée d’un niveau
	let baseURL = requête._parsedUrl.pathname.split("/")
	baseURL.splice(-1, 1)

	réponse.render(vue, {
		"URL": {
			...requête._parsedUrl,
			"query": requête.query,
			"body": requête.body,
			"params": requête.params,
		},
		"baseURL": baseURL.join("/"),
		"langue": requête.langue,
		"session": requête.session,
		"jetonCSRF": requête.csrfToken(),
		...paramètres,
	}, function (erreur, rendu) {
		if (erreur) {
			console.log(erreur)
			options.fonctionSuivante(générerErreur(500, "renduVue"))
		}

		else
			réponse.send(rendu)
	})
}

const afficher = async function (requête, réponse, options, paramètres = {}) {
	if (droits.vérifier(requête.session, "fiche")) {
		let instance = await requête.modèle[options.type].obtenir(options.idInstance)

		// Si l’instance n’existe pas ou que c’est un membre non validé, la fiche est inaccessible
		if (instance !== null && (options.type === "membre" && instance.estValidé === true)) {
			rendre(requête, réponse, `fiche/${options.type}`, { "fonctionSuivante": options.fonctionSuivante, }, {
				[ options.type ]: instance,
				...paramètres,
				"droitModification": droits.vérifier(requête.session, "modification", {
					"type": options.type,
					instance,
				})
			})
		}

		else
			options.fonctionSuivante(générerErreur(404, options.erreur))
	}

	else
		réponse.redirect(`/connexion?vers=${requête._parsedUrl.pathname}`)
}

const afficherAnnuaire = async function (requête, réponse, options, paramètres = {}) {
	// Dans le cas de la liste des candidats, envoie aussi les options pour la vérification (contenant l’instance d’offre)
	if (droits.vérifier(requête.session, options.droit || "annuaire", options)) {
		// Rediriger automatiquement vers /1 si non défini
		if (!requête.params.page)
			réponse.redirect(requête._parsedUrl.pathname + "/1" + (requête._parsedUrl.search || ""))

		else {
			try {
				const type = options.type.virtuel || options.type,
					modèle = options.type.réel || options.type

				const numéroPage = parseInt(requête.params.page, 10)
				const { résultats, nombreRésultats, } = await requête.modèle.rechercheUtilisateur.lister(options.filtres || requête.query, type, modèle, numéroPage)

				rendre(requête, réponse, options.vue || `annuaire/${type}s`, { "fonctionSuivante": options.fonctionSuivante, }, {
					numéroPage,
					"nombreRésultatsParPage": global.constantes.nombreRésultatsParPage,
					nombreRésultats,
					[ `${type}s` ]: résultats,
					"formulaireSoumis": options.filtres || requête.query,
					... paramètres,
				})
			}

			// Si une erreur survient (pour quelque raison que ce soit, potentiellement à cause d’un formulaire incorrect)
			catch (erreur) {
				options.fonctionSuivante(générerErreur(500, "erreurInterne"))
			}
		}
	}

	else if (requête.session.estConnecté)
		réponse.redirect(`/membre/${requête.session.membre.nomUtilisateur}`)

	else
		réponse.redirect(`/connexion?vers=${requête._parsedUrl.pathname}`)
}

const afficherFormulaire = async function (requête, réponse, options, paramètres) {
	if (droits.vérifier(requête.session, options.droit, { "type": options.type, })) {
		rendre(requête, réponse, `compte/${options.vue}`, { "fonctionSuivante": options.fonctionSuivante, }, {
			...paramètres,
			"vers": options.adresseRedirection || requête.query.vers || routeParDéfaut,
		})
	}

	else if (requête.session.estConnecté)
		réponse.redirect(options.adresseRedirection || routeParDéfaut)

	else
		réponse.redirect(options.adresseRedirection || `/connexion?vers=${requête._parsedUrl.pathname}`)
}

const afficherInscription = async function (requête, réponse, options) {
	afficherFormulaire(requête, réponse, {
		...options,
		"droit": "inscription",
	}, {
		"inscriptionComplète": droits.estInscriptionComplète(requête.session, { "type": options.type, }),
	})
}

const inscrire = async function (requête, réponse, options) {
	if (droits.vérifier(requête.session, "inscription", { "type": options.type, })) {
		let résultat = {
			"validé": false,
			"erreur": "ERREUR_FICHIER",
		}

		// Si le gestionnaire de fichiers n’a pas jeté une erreur, enregistre l’instance
		if (!options.erreur)
			résultat = await requête.modèle[options.type].créer(requête.body, requête.session.membre, {
				"langue": requête.langue,
				"membre": requête.session.membre,
			})

		rendre(requête, réponse, `compte/inscription/${options.type}`, { "fonctionSuivante": options.fonctionSuivante, }, {
			résultat,
			"inscriptionComplète": droits.estInscriptionComplète(requête.session, { "type": options.type, }),
		})
	}

	else
		réponse.redirect(routeParDéfaut)
}

const afficherModification = async function (requête, réponse, options) {
	const instance = await requête.modèle[options.type].obtenir(options.idInstance)

	// Si droit de modification sur cette instance (même si nulle)
	if (droits.vérifier(requête.session, "modification", {
		"type": options.type,
		instance,
	})) {
		if (instance !== null) {
			const modificationComplète = droits.estModificationComplète(requête.session, {
				"type": options.type,
				instance,
			})

			const suppression = droits.vérifier(requête.session, "suppression", {
				"type": options.type,
				instance,
			})

			if (!options.mode || options.mode === "affichage")
				rendre(requête, réponse, `compte/modification/${options.vue || options.type}`, { "fonctionSuivante": options.fonctionSuivante, }, {
					[ options.type ]: instance,
					modificationComplète,
					suppression,
				})

			else if (options.mode === "modification")
				modifier(requête, réponse, {
					...options,
					modificationComplète,
					suppression,
				})
		}

		else
			options.fonctionSuivante(générerErreur(404, options.codeErreur))
	}

	// Si non, renvoie sur la page de l’instance
	else if (requête.session.estConnecté)
		réponse.redirect(`/${options.type}/${options.idInstance}`)

	// Ou en connexion
	else
		réponse.redirect(`/connexion?vers=${requête._parsedUrl.pathname}`)
}

const modifier = async function (requête, réponse, options, paramètres) {
	const instance = await requête.modèle[options.type].obtenir(options.idInstance)

	// Si droit de modification sur cette instance (même si nulle)
	if (droits.vérifier(requête.session, "modification", {
		"type": options.type,
		instance,
	})) {
		if (instance !== null) {
			const modificationComplète = droits.estModificationComplète(requête.session, {
				"type": options.type,
				instance,
			})

			const suppression = droits.vérifier(requête.session, "suppression", {
				"type": options.type,
				instance,
			})

			let résultat

			if (options.erreur)
				résultat = {
					"validé": false,
					"erreur": "ERREUR_FICHIER",
				}

			else
				// Tente de mettre à jour l’objet en base de données
				résultat = await requête.modèle[options.type][options.méthode || "modifier"](options.idInstance, requête.body, modificationComplète)

			// Si le résultat est positif
			if (résultat.validé) {
				// Si la modification a généré un nouvel identifiant d’instance (uniquement dans la modification de membre ou d’organisation)
				if (résultat.nouvelIdInstance)
					// Met à jour l’identifiant d’instance
					options.idInstance = résultat.nouvelIdInstance

				// Met à jour le membre en session par conséquent
				if (requête.session.estConnecté) {
					requête.session.membre = await requête.modèle.membre.obtenir(options.type === "membre" ? options.idInstance : requête.session.membre.nomUtilisateur)
				}
			}

			// Puis raffiche la vue de modification avec réponse de modification
			rendre(requête, réponse, `compte/modification/${options.vue || options.type}`, { "fonctionSuivante": options.fonctionSuivante, }, {
				résultat,

				// Récupère l’objet de nouveau après ses modifications
				[ options.type ]: await requête.modèle[options.type].obtenir(options.idInstance),

				...paramètres,
				modificationComplète,
				suppression,

				// Et indique une redirection à faire quand l’URL n’est plus valide, null autrement
				"redirection": résultat.nouvelIdInstance ? `/${options.type}/${résultat.nouvelIdInstance}/modifier/compte` : null,
			})
		}

		else
			options.fonctionSuivante(générerErreur(404, options.codeErreur))
	}

	// Si non, renvoie sur la page de l’instance
	else if (requête.session.estConnecté)
		réponse.redirect(`/${options.type}/${options.idInstance}`)

	// Ou en connexion
	else
		réponse.redirect(`/connexion?vers=${requête._parsedUrl.pathname}`)
}

const supprimer = async function (requête, réponse, options) {
	if (droits.vérifier(requête.session, "suppression", {
		"type": options.type,
		"instance": await requête.modèle[options.type].obtenir(options.idInstance, []),
	})) {
		requête.modèle[options.type].supprimer(options.idInstance)
		réponse.redirect(routeParDéfaut)
	}

	else
		réponse.redirect(`/${options.adresse || options.type}/${options.idInstance}`)
}

module.exports = {
	routeParDéfaut,
	rendre,
	afficher,
	afficherAnnuaire,
	afficherFormulaire,
	afficherInscription,
	inscrire,
	afficherModification,
	modifier,
	supprimer,
}
