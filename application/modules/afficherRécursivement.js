
// Affiche récursivement un objet en console (module de développement)
// Paramètres : objet, nombre
// Retour : undefined
module.exports = function (objet, indentation = 1) {
	if (typeof objet !== "object")
		throw new Error("L’argument n’est pas un objet.")

	else {
		réponse.write("{\n")

		Object.entries(objet).forEach(([clé, valeur]) => {
			let i

			if (typeof valeur !== "object") {
				for (i = 0; i < indentation; i++)
					réponse.write("    ")

				if (typeof valeur !== "function")
					réponse.write(clé + ": " + valeur + "\n")

				else
					réponse.write(clé + ": " + "function (…) {…}\n")
			}

			else {
				for (i = 0; i < indentation; i++)
					réponse.write("    ")

				réponse.write(clé)

				afr(valeur, indentation + 1)

				for (i = 0; i < indentation; i++)
					réponse.write("    ")
			}
		})

		réponse.write("}\n")
	}
}
