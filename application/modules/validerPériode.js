
// Valide une période représentée par deux dates
// Paramètres : date, date
// Retour : booléen
module.exports = function (dateDébut, dateFin) {
	// Vérifie que que la première date précède la seconde et que les deux dates existent
	return (dateDébut < dateFin) && global.modules.validerDate(dateDébut) && global.modules.validerDate(dateFin)
}
