
// Utilise les fonctions déclarées dans script.js

document.addEventListener("DOMContentLoaded", function () {
	// Déclare les composants Vue
	if (window.VueSelect)
		Vue.component("v-select", VueSelect.VueSelect)

	// Racine de notre Vue
	const élémentRacine = document.querySelector("section.container")

	// Éléments HTML divers, qui existent dans certains formulaires mais non dans tous
	const logotype = élémentRacine.querySelector("#logotype")

	new Vue({
		"el": élémentRacine,

		"data": {
			// Modification de membre
			"sourceImage": obtenirAttribut(logotype, "data-src", { "analyserJSON": false, }),
			"sourceImageParDéfaut": obtenirAttribut(logotype, "data-default-src", { "analyserJSON": false, }),
		},

		"methods": {
			"chargerImage": async function (évènement) {
				this.sourceImage = URL.createObjectURL(évènement.target.files[0])

				this.$refs.suppressionImage.removeAttribute("checked")
			},

			"supprimerImage": async function () {
				this.sourceImage = this.sourceImageParDéfaut

				this.$refs.suppressionImage.setAttribute("checked", "checked")
			},
		},
	})
})
