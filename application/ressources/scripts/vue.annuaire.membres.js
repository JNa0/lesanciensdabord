
// Utilise les fonctions déclarées dans script.js

document.addEventListener("DOMContentLoaded", function () {
	// Déclare les composants Vue
	if (window.VueSelect)
		Vue.component("v-select", VueSelect.VueSelect)

	// Racine de notre Vue
	const élémentRacine = document.querySelector("section.container")

	new Vue({
		"el": élémentRacine,

		"data": {
			"organisations": [],
			"organisation": null,

			"formations": [],
			"formation": null,
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

			"définirFormation": function (formation) {
				this.définir("formation", formation)
			},

			"requesterOrganisations": async function (recherche, indiquerChargement) {
				this.organisations = await requesterListe(recherche, indiquerChargement, "organisations")
				indiquerChargement(false)
			},

			"requesterFormations": async function (recherche, indiquerChargement) {
				this.formations = await requesterListe(recherche, indiquerChargement, "formations")
				indiquerChargement(false)
			},
		},
	})
})
