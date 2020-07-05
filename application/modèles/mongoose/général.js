
const Mongoose = require("mongoose")
const PROTOCOLE = "mongodb"
const IDENTIFIANT = "admin"
const MOT_DE_PASSE = "exampleteeth.albumin.unbodied.exude"
const HÔTE = "mongo"
const PORT = "27017"
const COLLECTION = "lesanciensdabord"
const ADRESSE = "${PROTOCOLE}://${IDENTIFIANT}:${MOT_DE_PASSE}@${HÔTE}/${COLLECTION}"
