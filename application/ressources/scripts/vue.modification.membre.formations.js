
// Utilise les fonctions déclarées dans script.js

document.addEventListener("DOMContentLoaded", function () {
	// Déclare les composants Vue
	if (window.VueSelect)
		Vue.component("v-select", VueSelect.VueSelect)

	// Racine de notre Vue
	const élémentRacine = document.querySelector("section.container")

	// Permet d’identifier les formations lors de leur génération dans la page de modification de membre
	let indiceFormation = 0

	new Vue({
		"el": élémentRacine,

		"data": {
			"formations": [],
			"établissements": [],

			// Limites pour les saisies de date
			// J’ai balayé large pour éviter certains cas bloquants
			"dateMinimaleFormation": new Date(new Date().setYear(new Date().getFullYear() - 80)),
			"dateMaximaleFormation": new Date(new Date().setYear(new Date().getFullYear() + 5)),

			// Modification de membre
			"inscriptions": obtenirAttribut(élémentRacine.querySelector(":scope form"), "data-inscriptions", {
				// Ici, je définit la propriété « période » pour le sélection d’un intervalle temporel dans le formulaire de modification de membre
				"transformateur": function (inscriptions) {
					inscriptions.forEach(inscription => {
						Object.defineProperty(inscription, "période", {
							"value": undefined,
							"writable": true,
						})

						if (inscription.dateEntrée && inscription.dateSortie)
							inscription.période = {
								"start": new Date(inscription.dateEntrée),
								"end": new Date(inscription.dateSortie),
							}

						else
							inscription.période = { "start": null, "end": null, }
					})
				},
			}),
		},

		"methods": {
			"définir": function (nom, valeur) {
				this[nom] = valeur
			},

			"définirFormation": function (formation) {
				this.définir("formation", formation)
			},

			"définirÉtablissement": function (établissement) {
				this.définir("établissement", établissement)
			},

			"requesterFormations": async function (recherche, indiquerChargement) {
				this.formations = await requesterListe(recherche, indiquerChargement, "formations")
				indiquerChargement(false)
			},

			"requesterEtablissements": async function (recherche, indiquerChargement) {
				this.établissements = await requesterListe(recherche, indiquerChargement, "établissements")
				indiquerChargement(false)
			},

			"ajouterFormation": async function () {
				this.inscriptions.push({ "_id": ++indiceFormation, "période": { "start": null, "end": null, }, })
			},

			"supprimerFormation": async function (indice) {
				this.inscriptions.splice(indice, 1)
			},
		},
	})
})
