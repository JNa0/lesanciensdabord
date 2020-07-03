
module.exports = {
	"créer": function (requête, réponse) {
		Object.keys(requête.params).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.query).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.body).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		réponse.end()
	},

	"lister": function (requête, réponse) {
		const membres = réponse.mongodb.membre.lister()

		if (membres.length > 0)
			membres.forEach(membre => réponse.write(membre.prénom + " " + membre.nom))

		else
			réponse.write("nul membre")

		réponse.end()
	},
}
