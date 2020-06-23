
const systèmeFichiers = require("fs")
const chemin = require("path")

module.exports = function charger (dossier, modules = {}) {
	systèmeFichiers
	.readdirSync(dossier)
	.forEach(function (nomObjet) {
		let objetSF = chemin.join(dossier, nomObjet),
			estDossier = systèmeFichiers.statSync(objetSF).isDirectory(),
			nomDocument = nomObjet.split(".").slice(0, -1).join("."),
			estNomValide = nomObjet.match(/^[^\\\/ .,:;?!*'"<>|]+\.js$/) !== null

		// Si l’objet parcouru est un fichier JavaScript, le charge comme module
		if (!estDossier && estNomValide)
			modules[nomDocument] = require(objetSF)

		// Si non, si c’est un dossier, le parcourt comme un groupe de modules
		else if (estDossier) {
			modules[nomObjet] = {}
			charger(chemin.join(dossier, nomObjet), modules[nomObjet])
		}
	})

	return modules
}
