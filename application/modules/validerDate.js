
// Valide une date
// Paramètre : date
// Retour : booléen
module.exports = function (date) {
	// Vérifie que la date existe
	return !Number.isNaN(date.getTime())
}
