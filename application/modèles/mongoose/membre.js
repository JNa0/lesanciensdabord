
const tout = require("./_schémas.js")
const schémas = tout.schémas

module.exports = {
	"lister": function () {
		return {
			"rech": schémas.membre.find({ "nom": "De Rostand" }), //.sort({ "prénom": "asc" })
			"client": tout.client
		}
/*
		return {
			"exec": function (f) {
				return f(null, [ { "nom": "toast", "prénom": "test", }, { "nom": "michel", "prénom": "éfant", }, ])
			},
			"schémas": schémas,
		}
*/
	},
	"créer": function () {
		return
	},
}
