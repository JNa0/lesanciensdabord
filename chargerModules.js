
const systèmeFichiers = require("fs")
const chemin = require("path")

const séparateurExtension = "."
const caractèresInitiauxInterdits = [ "_", ".", ]

module.exports = function charger (dossier, modules = {}) {
	systèmeFichiers
	.readdirSync(dossier)
	.forEach(function (nomObjet) {
		let objetSF = chemin.join(dossier, nomObjet),
			estDossier = systèmeFichiers.statSync(objetSF).isDirectory(),
			nomDocument = nomObjet.split(séparateurExtension).slice(0, -1).join(séparateurExtension),
			estNomValide = nomObjet.match(/^[^\\\/ .,:;?!*'"<>|]+\.js$/) !== null

		// Si l’objet n’a pas un caractère initial interdit
		if (!caractèresInitiauxInterdits.includes(nomObjet[0])) {
			// Si l’objet parcouru est un fichier JavaScript, le charge comme module
			if (!estDossier && estNomValide)
				modules[nomDocument] = require(objetSF)

			// Si non, si c’est un dossier, le parcourt comme un groupe de modules
			else if (estDossier) {
				modules[nomObjet] = {}
				charger(chemin.join(dossier, nomObjet), modules[nomObjet])
			}
		}
	})

	return modules
}
