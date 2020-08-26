
// Utilise les fonctions déclarées dans script.js

document.addEventListener("DOMContentLoaded", function () {
	// Déclare les composants Vue
	if (window.VueSelect)
		Vue.component("v-select", VueSelect.VueSelect)

	// Racine de notre Vue
	const élémentRacine = document.querySelector("section.container")

	const service = obtenirAttribut(élémentRacine.querySelector(":scope form"), "data-service")

	new Vue({
		"el": élémentRacine,

		"data": {
			"organisations": [],
			"organisation": service && service.organisation,

			"services": [],
			"service": service,
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
		},
	})
})
