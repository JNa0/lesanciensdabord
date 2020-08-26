
// Génère une nom d’utilisateur unique pour un membre ou une organisation
// Paramètres : Mongoose.Schema, chaine
// Retour : chaine
module.exports = async function (schémaCollection, nomBase) {
	// Vérifie l’existence d’une instance associée à ce nom de base
	let instanceNom = await schémaCollection.obtenir(nomBase, [])

	// Si aucune instance ne correspond au nom de base, il est libre
	if (instanceNom === null)
		return nomBase

	// Si non, ajoute un nombre derrière, incrémenté d’autant qu’il faudra pour avoir un nom d’utilisateur unique
	else {
		let i = 1

		do {
			instanceNom = await schémaCollection.obtenir(nomBase + i, [])

			if (instanceNom === null) {
				return nomBase + i
				break
			}

			else
				i++
		}
		while (true)
	}
}
