
/*

	require("mongoose")
	.connect(ADRESSE_MDB, {
		"useNewUrlParser": true
	})

	db.once("open", () => {
		console.log("Connexion établie : ", ADRESSE_MDB)
	})

	db.on("error", () => {
		console.error("Échec de connexion : ", ADRESSE_MDB)
	})

*/

//const ADRESSE_MDB = "mongodb://localhost:27017"

const NOM_BDD = "lesanciensdabord"

function exécuter (fonction, gérerErreur) {
	require("mongodb")
	.MongoClient
	.connect(ADRESSE_MDB, {
		"useUnifiedTopology": true
	})
	.then(fonction)
	.catch(gérerErreur || function (erreur) {
		throw erreur
	})
}

module.exports = {
	"creer": function (requête, réponse) {
		exécuter(client => {
			client
			.db(NOM_BDD)
			.collection("membre")
			.insertOne({ "nom": "Gaillou", "prénom": "Roger", })
		})

		/*
		membres.insertOne({
			"nom": requête.params.nom,
			"prénom": requête.params.prénom,
			"dateNaissance": requête.params.dateNaissance,
		})
		.then(() => {
			réponse.write("\nSuccès d’insertion\n")
		})
		.catch(erreur => {
			throw erreur
		})
		*/

		Object.keys(requête.params).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.query).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		Object.keys(requête.body).forEach(([clé, valeur]) => {
			réponse.write(`${clé} : ${valeur}\n`)
		})

		réponse.send("\ntout va bien")
	},

	"lister": function (requête, réponse) {
		const mongoose = require("mongoose")
		const adresse = "mongodb://localhost:27017/lesanciensdabord"
		const identifiant = "admin"
		const motdepasse = "exampleteeth.albumin.unbodied.exude"

		const conection = mongoose.connect(adresse, {
				"useUnifiedTopology": true,
				"user": identifiant,
				"pass": motdepasse,
			})
			.then(BDD => {
				réponse.write("enfin bordel de merde!")

				/*
				let membre = BDD
					.collection("membre")
					.find()

                	        réponse.write(${membres.length} membre(s) trouvé(s).<br/>)

				membres.forEach(membre => {
					réponse.write(JSON.stringify(membre) + "<br/>")
				})
				*/
			})
			.catch (erreur => {
				throw erreur
				process.exit()
			})

		réponse.end()
	},

	"modifier": function (requête, réponse) {
		réponse.send("\ntout va bien")
	},

	"supprimer": function (requête, réponse) {
		réponse.send("\ntout va bien")
	},
}
