document.addEventListener("DOMContentLoaded",function () {
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

	// Si l’extension bulmaCalendar existe
	if (window.bulmaCalendar) {
		// jà est un mot d’ancien français signifiant “maintenant”
		// let jà = new Date()

		// Ajoute le “DatePicker”
		bulmaCalendar.attach("[type='date']", {
			"dateFormat": "DD/MM/YYYY",
			"lang": "fr",
			"cancelLabel": "Annuler",
			"clearLabel": "Supprimer",
			"validateLabel": "Valider",
			"todayLabel": "Aujourd’hui",
			"nowLabel": "Maintenant",
			"closeOnSelect": false,
			"todayButton": false,

			// La gestion des dates minimale/maximale est complétement cassée…
			/*
			"minDate": new Date(`${jà.getMonth()}/${jà.getDate()}/${jà.getFullYear() - 96}`),
			"maxDate": new Date(`${jà.getMonth()}/${jà.getDate()}/${jà.getFullYear() - 16}`),
			*/
		})
		.forEach(calendrier => {
			// Ajoute un écouteur d’évènement de sélection
			calendrier.on("date:selected", date => {
				console.log(date)
			})
		})
	}
})