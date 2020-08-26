
// Utilise les fonctions déclarées dans script.js

document.addEventListener("DOMContentLoaded", function () {
	// Déclare les composants Vue
	if (window.VueSelect)
		Vue.component("v-select", VueSelect.VueSelect)

	// Racine de notre Vue
	const élémentRacine = document.querySelector("section.container")

	const jà = new Date()

	const rechercheEmploi = obtenirAttribut(élémentRacine.querySelector(":scope form"), "data-recherche"),
		domainesUtilisateur = rechercheEmploi.domaines

	const domaines = obtenirAttribut(élémentRacine.querySelector(":scope form"), "data-domaines", { "valeurParDéfaut": [], })

	new Vue({
		"el": élémentRacine,

		"data": {
			"intervalleEmploi": { "start": rechercheEmploi && new Date(rechercheEmploi.début), "end": rechercheEmploi && new Date(rechercheEmploi.fin), },

			// Limites pour les saisies de date
			// J’ai balayé large pour éviter certains cas bloquants
			"dateMinimaleEmploi": new Date(new Date().setYear(new Date().getFullYear() - 1)),
			"dateMaximaleEmploi": new Date(new Date().setYear(new Date().getFullYear() + 4)),

			"domaines": domaines,
			"domainesFiltrés": domaines.filter(domaine => !domainesUtilisateur.includes(domaine.idDomaine)),
			"domainesSélectionnés": domaines.filter(domaine => domainesUtilisateur.includes(domaine.idDomaine)),

			"typeEmploi": obtenirAttribut(élémentRacine.querySelector("#typeEmploi"), "data-type-emploi", { "analyserJSON": false, }),
		},

		"methods": {
			"définir": function (nom, valeur) {
				this[nom] = valeur
			},

			"filtrerDomaines": async function () {
				this.domainesFiltrés = this.domaines.filter(domaine => {
					return !this.domainesSélectionnés.includes(domaine)
				})
			},

			"chercherDomaines": async function (recherche, indiquerChargement) {
				indiquerChargement(true)

				const expressionRégulière = new RegExp(recherche, "ui")

				this.domainesFiltrés = this.domaines.filter(domaine => {
					return expressionRégulière.test(domaine.intitulé) && !this.domainesSélectionnés.includes(domaine)
				})

				indiquerChargement(false)
			},
		},
	})
})
