
// Filtre une chaine de caractères pour en supprimer les caractères interdits
// Paramètres : chaine, chaine|expression régulièr|fonction
// Retour : chaine
module.exports = function (chaineCaractères, caractèresInterdits = null) {
	if (caractèresInterdits === null)
		return chaineCaractères

	else if (typeof caractèresInterdits === "string")
		return chaineCaractères
			.split("")
			.filter(caractère => caractèresInterdits.indexOf(caractère) === -1)
			.join("")

	else if (caractèresInterdits instanceof RegExp)
		return chaineCaractères.replace(caractèresInterdits, "")

	else if (typeof caractèresInterdits === "function")
		return chaineCaractères
			.split("")
			.filter((caractère, indice) => caractèresInterdits.bind(null, [ caractère, indice ]))
			.join("")

	else
		throw ValueError("caractèresInterdits doit être une chaine, une expression rationnelle ou une fonction (caractère, indice)")
}
