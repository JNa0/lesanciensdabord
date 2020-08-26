
module.exports = {
	"navigation": [
		{
			"adresse": "/accueil",
			"libellé": "Accueil",
		},
		{
			"adresse": "/annuaire",
			"libellé": "Annuaire",
			"sousLiens": [
				{
					"adresse": "/annuaire/membres",
					"libellé": "Membres",
				},
				{
					"adresse": "/annuaire/organisations",
					"libellé": "Organisations",
				},
			],
		},
		{
			"adresse": "/offres",
			"libellé": "Offres",
		},
		{
			"adresse": "/forums",
			"libellé": "Forums",
		},
		{
			"adresse": "/administration",
			"libellé": "Administration",
			"droit": "administration",
		},
	],
	"libelléMenu": "Menu",
}
