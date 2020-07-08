
module.exports = {
	"créer": function (requête, réponse) {
		Object.entries(requête.params).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.entries(requête.query).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.entries(requête.body).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		réponse.end()
	},

	"lister": function (requête, réponse) {
		let rs = réponse.mongoose.membre.lister()
		let mg = require("mongoose")
		let co =  rs.client // mg.connection

		//Object.entries(co.models).forEach(([c,v]) => réponse.write(c + "\n"))
		réponse.write("_etat_ : " + mg.STATES[co.readyState])

		rs.rech.exec((erreur, membres) => {
			réponse.write("    ah!\n")

			if (erreur)
				throw erreur

			if (membres.length > 0) {
				réponse.write(membres.length + " membres inscrits !\n")
				membres.forEach(membre => réponse.write(membre.prénom + " " + membre.nom + "\n"))
			}

			else
				réponse.write("nul membre\n")
		})

réponse.end()

function afr (objet, d = 1) {
	if (typeof objet !== "object")
		réponse.write("impossible: " + objet)

	else {
		réponse.write("{\n")

		Object.entries(objet).forEach(([clé, valeur]) => {
			let i

			if (typeof valeur !== "object") {
				for (i = 0; i < d; i++)
					réponse.write("    ")

				réponse.write(clé + ": " + valeur + "\n")
			}

			else {
				for (i = 0; i < d; i++)
					réponse.write("    ")
				réponse.write(clé)

				afr(valeur, d + 1)

				for (i = 0; i < d; i++)
					réponse.write("    ")
			}
		})

		réponse.write("}\n")
	}
}

// afr(réponse.mongoose)
	},
}
