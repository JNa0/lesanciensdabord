
const chemin = require("path")
const configuration = require("../configuration")
const systèmeFichiers = require(chemin.join(configuration.dossiers.modules, "chargerModules"))

module.exports = function (codeLangue) {
	chargerModules(chemin.join(chemin.join(configuration.dossiers.application, configuration.dossiers.traductions), codeLangue))
}
