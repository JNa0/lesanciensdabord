
const général = require("./général.js")

module.exports = {
	"lister": async function () {
		return await général.client.once("open", async function (CLIENT_MONGO) {
			return await CLIENT_MONGO
				.collection("membre")
				.find()
				.sort({ prénom: 1 })
				.toArray()
		})
	},
	"créer": function () {
		return
	},
}
