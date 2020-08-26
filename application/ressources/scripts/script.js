
document.addEventListener("DOMContentLoaded", function () {
	// Gestion du menu “hamburger” sur tablettes et téléphones mobiles
	Array.from(document.querySelectorAll(".navbar-burger"))
	.forEach(barreNavigation => {
		// Ajoute un écouteur de clic sur chacun
		barreNavigation.addEventListener("click", () => {
			// Récupère la cible via l’attribut “data-target”
			const cible = document.getElementById(barreNavigation.dataset.target)

			// Et ajoute (ou retire) la classe “is-active” sur le .navbar-burger et le .navbar-menu
			barreNavigation.classList.toggle("is-active")
			cible.classList.toggle("is-active")
		})
	})

	// Permet de ne pas excéder une certaine fréquence lors d’appels répétés à une fonction
	// Le délai indique le temps minimal laissé entre deux appels
	const limiter = function (fonctionRappel, délai) {
		let retardateur

		return async function (...argumentsFonctionRappel) {
			clearTimeout(retardateur)

			// Permet de récupérer le résultat de la fonction de rappel
			return await new Promise(function (résoudre, rejeter) {
				retardateur = setTimeout(() => {
					résoudre(fonctionRappel(...argumentsFonctionRappel))
				}, délai)
			})
		}
	}

	// La fonction ne peut être appelée plus de 4 fois par secondes, permet d’éviter les débordements de requêtage
	const requester = limiter(async function (adresse) {
		return await fetch(adresse)
		.then(réponse => réponse.json())
		.catch(réponse => null)
	}, 250)

	// Effectue une requête AJAX asychrone pour charger une liste de données sur le serveur
	window.requesterListe = async function (recherche, indiquerChargement, nomVariable, adresse) {
		if (recherche) {
			indiquerChargement(true)

			// Convertit des caractères interdits ou réservés pour garantir l’intégrité de l’URL de la requête
			const rechercheConvertie = recherche
				.replace(/%/g, "%25")
				// Risqué : certains navigateurs considèrent que deux points (même encodés) équivalent une remontée de niveau dans l’adresse URL, excepté Firefox
				.replace(/\./g, "%2E")
				.replace(/\\/g, "%5C")
				.replace(/#/g, "%23")
				.replace(/\?/g, "%3F")

			return await requester(`/ajax/${adresse || nomVariable}/${rechercheConvertie}`)
		}

		else
			return []
	}

	// Permet de récupérer les données encodées dans un attribut et de les analyser
	/*
		options {
			valeurParDéfaut: * (null),
			analyserJSON: booléen (true),
			transformateur: fonction|null (null),
		}
	*/
	window.obtenirAttribut = function (élémentHTML, nomAttribut, options = {}) {
		let résultat

		if (!élémentHTML)
			return null

		// Tente de lire sa propriété ou se rabat sur la valeur par défaut
		if (!élémentHTML.hasAttribute(nomAttribut))
			return options.valeurParDéfaut || null

		else {
			if (options.analyserJSON !== false)
				résultat = JSON.parse(élémentHTML.getAttribute(nomAttribut))

			else
				résultat = élémentHTML.getAttribute(nomAttribut)
		}

		if (options.transformateur || null)
			options.transformateur(résultat)

		return résultat
	}
})
