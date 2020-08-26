
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
			"institutions": [],
			"institution": null,
		},

		"methods": {
			"définir": function (nom, valeur) {
				this[nom] = valeur
			},

			"définirInstitution": function (institution) {
				this.définir("institution", institution)
			},

			"requesterInstitutions": async function (recherche, indiquerChargement) {
				this.institutions = await requesterListe(recherche, indiquerChargement, "institutions")
				indiquerChargement(false)
			},
		},
	})
})
