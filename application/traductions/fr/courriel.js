
module.exports = {
	"inscription": {
		"sujet": "Votre mot de passe Les anciens d’abord",
		"contenuTexte": (identifiant, motDePasse) => `Bonjour,

		Vous avez été inscrit sur Les anciens d’abord.
		Voici votre identifiant et votre mot de passe : ${identifiant} – ${motDePasse}. Nous vous conseillons changer ce dernier après votre première connexion.

		À bientôt.`,
		"contenuHTML": (identifiant, motDePasse) => `<p style="font-family:Arial;font-size:12px">Bonjour,

		Vous avez été inscrit sur <strong>Les anciens d’abord</strong>.
		Voici votre identifiant et votre mot de passe : <kbd>${identifiant}</kbd> – <kbd>${motDePasse}</kbd>. Nous vous conseillons changer ce dernier après votre première connexion.

		À bientôt.</p>`,
	}
}
