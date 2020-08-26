
// Utilise les fonctions déclarées dans script.js

document.addEventListener("DOMContentLoaded", function () {
	// Déclare les composants Vue
	if (window.VueSelect)
		Vue.component("v-select", VueSelect.VueSelect)

	// Racine de notre Vue
	const élémentRacine = document.querySelector("section.container")

	// Éléments HTML divers, qui existent dans certains formulaires mais non dans tous
	const photographie = élémentRacine.querySelector("#photographie")

	const jà = new Date()

	new Vue({
		"el": élémentRacine,

		"data": {
			// Date pour les formulaires, notamment la date de naissance de l’utilisateur
			"dateNaissance": new Date(obtenirAttribut(élémentRacine.querySelector(":scope form"), "data-date-naissance", { "analyserJSON": false, })),

			// Limites pour les saisies de date
			// J’ai balayé large pour éviter certains cas bloquants
			"dateMinimaleNaissance": new Date(new Date().setYear(new Date().getFullYear() - 100)),
			"dateMaximaleNaissance": new Date(new Date().setYear(new Date().getFullYear() - 15)),

			// Modification de membre
			"sourceImage": obtenirAttribut(photographie, "data-src", { "analyserJSON": false, }),
			"sourceImageParDéfaut": obtenirAttribut(photographie, "data-default-src", { "analyserJSON": false, }),

			// Idem
			"suppressionCV": obtenirAttribut(élémentRacine.querySelector("#suppressionCV"), "checked", { "valeurParDéfaut": false, "analyserJSON": false, }),
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

			"définirCV": async function (évènement) {
				this.suppressionCV = false
				this.$refs.suppressionCV.removeAttribute("checked")
			},

			"supprimerCV": async function () {
				this.suppressionCV = true
				this.$refs.suppressionCV.setAttribute("checked", "checked")
			},
		},
	})
})
