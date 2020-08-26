
// Convertit une date du format français (JJ/MM/AAAA) au format informatique (AAAA-MM-JJ)
// Paramètres : chaine
// Retour : chaine
module.exports = function (date) {
	return date.replace(global.constantes.formatDateRemplacement, "$3-$2-$1")
}
