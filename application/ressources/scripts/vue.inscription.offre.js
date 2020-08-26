
// Utilise les fonctions déclarées dans script.js

document.addEventListener("DOMContentLoaded", function () {
	// Déclare les composants Vue
	if (window.VueSelect)
		Vue.component("v-select", VueSelect.VueSelect)

	// Racine de notre Vue
	const élémentRacine = document.querySelector("section.container")

	const jà = new Date()

	const domaines = obtenirAttribut(élémentRacine.querySelector(":scope form"), "data-domaines", { "valeurParDéfaut": [], })

	new Vue({
		"el": élémentRacine,

		"data": {
			"intervalleValidité": { "start": null, "end": null, },

			// Limites pour les saisies de date
			// J’ai balayé large pour éviter certains cas bloquants
			"dateMinimaleEmploi": new Date(new Date().setYear(new Date().getFullYear() - 1)),
			"dateMaximaleEmploi": new Date(new Date().setYear(new Date().getFullYear() + 4)),

			"organisations": [],
			"organisation": obtenirAttribut(élémentRacine.querySelector(":scope form"), "data-organisation", { "valeurParDéfaut": null, }),

			"services": [],
			"service": null,

			"domaines": domaines,
			"domainesFiltrés": domaines,
			"domainesSélectionnés": [],
		},

		"methods": {
			"définir": function (nom, valeur) {
				this[nom] = valeur
			},

			"définirOrganisation": function (organisation) {
				this.définir("organisation", organisation)

				// Redéfinit en conséquence le service
				this.définir("service", null)
			},

			"définirService": function (service) {
				this.définir("service", service)
			},

			"requesterOrganisations": async function (recherche, indiquerChargement) {
				this.organisations = await requesterListe(recherche, indiquerChargement, "organisations")
				indiquerChargement(false)
			},

			"requesterServices": async function (recherche, indiquerChargement) {
				if (this.organisation) {
					this.services = await requesterListe(recherche, indiquerChargement, "services", `organisation/${this.organisation}/services`)

					indiquerChargement(false)
				}
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
