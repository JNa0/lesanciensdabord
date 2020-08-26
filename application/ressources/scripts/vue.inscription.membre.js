
// Utilise les fonctions déclarées dans script.js

document.addEventListener("DOMContentLoaded", function () {
	// Déclare les composants Vue
	if (window.VueSelect)
		Vue.component("v-select", VueSelect.VueSelect)

	// Racine de notre Vue
	const élémentRacine = document.querySelector("section.container")

	const jà = new Date()

	new Vue({
		"el": élémentRacine,

		"data": {
			"dateNaissance": null,

			// Limites pour les saisies de date
			// J’ai balayé large pour éviter certains cas bloquants
			"dateMinimaleNaissance": new Date(new Date().setYear(new Date().getFullYear() - 100)),
			"dateMaximaleNaissance": new Date(new Date().setYear(new Date().getFullYear() - 15)),
		},
	})
})
