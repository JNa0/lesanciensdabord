
// Utilise les fonctions déclarées dans script.js

document.addEventListener("DOMContentLoaded", function () {
	// Déclare les composants Vue
	if (window.VueSelect)
		Vue.component("v-select", VueSelect.VueSelect)

	// Racine de notre Vue
	const élémentRacine = document.querySelector("section.container")

	const jà = new Date()

	// Éléments HTML divers, qui existent dans certains formulaires mais non dans tous
	const fichier = élémentRacine.querySelector("#fichier")

	const offre = obtenirAttribut(élémentRacine.querySelector(":scope form"), "data-offre"),
		domainesOffre = offre.domaines

	const domaines = obtenirAttribut(élémentRacine.querySelector(":scope form"), "data-domaines", { "valeurParDéfaut": [], })

	new Vue({
		"el": élémentRacine,

		"data": {
			"intervalleValidité": { "start": new Date(offre.débutValidité), "end": new Date(offre.finValidité), },

			// Limites pour les saisies de date
			// J’ai balayé large pour éviter certains cas bloquants
			"dateMinimaleEmploi": new Date(new Date().setYear(new Date().getFullYear() - 1)),
			"dateMaximaleEmploi": new Date(new Date().setYear(new Date().getFullYear() + 4)),

			"organisations": [],
			"organisation": offre.service.organisation,

			"services": [],
			"service": offre.service,

			"domaines": domaines,
			"domainesFiltrés": domaines.filter(domaine => !domainesOffre.includes(domaine.idDomaine)),
			"domainesSélectionnés": domaines.filter(domaine => domainesOffre.includes(domaine.idDomaine)),

			"typeEmploi": offre.typeEmploi,

			"suppressionFichier": obtenirAttribut(élémentRacine.querySelector("#suppressionFichier"), "checked", { "valeurParDéfaut": false, "analyserJSON": false, }),
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
					this.services = await requesterListe(recherche, indiquerChargement, "services", `organisation/${this.organisation.nomUtilisateur}/services`)

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

			"définirFichier": async function (évènement) {
				this.suppressionFichier = false
				this.$refs.suppressionFichier.removeAttribute("checked")
			},

			"supprimerFichier": async function () {
				this.suppressionFichier = true
				this.$refs.suppressionFichier.setAttribute("checked", "checked")
			},
		},
	})
})
