
module.exports = {

	"clésStatuts": [ "étudiant", "ancien", "enseignant", "administrateur", ],
	"clésTypesEmploi": [ "stage", "alternance", "emploi", ],
	"clésSecteursActivité": [ "tic", "agroalim", ],
	"clésDomaines": [ "devweb", "adminbdd", "cybersec", ],
	"clésTypesEmploi": [ "stage", "alternance", "emploi", ],
	"clésQualitéDurée": [ "semaine", "mois", "année", ],
	"clésPays": [ "AL", "DE", "AD", "AT", "BE", "BY", "BA", "BG", "HR", "DK", "ES", "EE", "FI", "FR", "GR", "HU", "IE", "IS", "IT", "LV", "LT", "LI", "LU", "MK", "MT", "MD", "MC", "ME", "NO", "NL", "PL", "PT", "RO", "GB", "SM", "RS", "SK", "SI", "SE", "CH", "CZ", "UA", "VA", "AG", "AR", "BS", "BB", "BZ", "BO", "BR", "CA", "CL", "CO", "CR", "CU", "DM", "EC", "US", "GD", "GT", "GY", "HT", "HN", "JM", "MX", "NI", "PA", "PY", "PE", "DO", "KN", "VC", "LC", "SV", "SR", "TT", "UY", "VE", "SA", "BH", "CY", "EG", "AE", "IQ", "IR", "IL", "JO", "KW", "LB", "OM", "PS", "QA", "SY", "TR", "YE", "AF", "AZ", "AM", "BT", "MM", "BN", "CN", "KP", "KR", "GE", "IN", "ID", "JP", "KZ", "KG", "LA", "MY", "MV", "NP", "UZ", "PK", "PH", "RU", "SG", "LK", "TJ", "TH", "TL", "TM", "VN", "ZA", "DZ", "AO", "BJ", "BW", "BF", "BI", "KH", "CM", "CV", "CF", "KM", "CG", "CD", "CI", "DJ", "ET", "ER", "SZ", "GA", "GM", "GH", "GN", "GW", "GQ", "KE", "LR", "LY", "MG", "MW", "ML", "MA", "MU", "MR", "MZ", "NA", "NE", "NG", "UG", "RW", "ST", "SN", "SC", "SL", "SO", "SD", "SS", "TZ", "TD", "TG", "TN", "ZM", "ZW", "AU", "CK", "FJ", "KI", "MH", "FM", "NR", "NU", "NZ", "PW", "PG", "SB", "WS", "TO", "TV", "VU", "AUTRE", ],

	// Expressions régulières de validation des données reçues dans les formulaires
	"formatNom": /^[a-zA-Z\p{L}\p{M}\p{Pc}\p{Join_Control}\-‐'’ ]{2,255}$/u,
	"formatNombre": /^[0-9]+$/,
	"formatDate": /^(?:0[1-9]|[12][0-9]|3[01])\/(?:0[1-9]|1[012])\/(?:19[0-9]{2}|20[0-9]{2})$/,
	"formatDateRemplacement": /^(?<jour>0[1-9]|[12][0-9]|3[01])\/(?<mois>0[1-9]|1[012])\/(?<année>19[0-9]{2}|20[0-9]{2})$/,
	"formatPériode": /^(?:0[1-9]|[12][0-9]|3[01])\/(?:0[1-9]|1[012])\/(?:19[0-9]{2}|20[0-9]{2}) - (?:0[1-9]|[12][0-9]|3[01])\/(?:0[0-9]|1[0-2])\/(?:19[0-9]{2}|20[0-9]{2})$/,
	"formatIntitulé": /^[a-zA-Z\p{L}\p{Mark}\p{Pc}\p{Join_Control}\p{P}\p{N}\-‐ ]{2,1023}$/u,
	// Adresses I18N UTF‐8
	"formatAdresseMél": /^[a-zA-Z\p{Alphabetic}0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z\p{Alphabetic}0-9](?:[a-zA-Z\p{Alphabetic}0-9\-]{0,61}[a-zA-Z\p{Alphabetic}0-9])?(?:\.[a-zA-Z\p{Alphabetic}0-9](?:[a-zA-Z\p{Alphabetic}0-9\-]{0,61}[a-zA-Z\p{Alphabetic}0-9])?)+$/u,
	// Capture les numéros de téléphones selon la norme E.164 (préfixée d’un plus suivi du code national et sans caractères parasites (espaces, points, tirets…))
	"formatNuméroTéléphone": /^\+[1-9][0-9]{1,14}$/,
	"formatCodePostal": /^[A-Z0-9][A-Z0-9 -]{0,10}[A-Z0-9]$/,
	"formatLienSite": /^https?:\/\/[a-zA-Z\p{Alphabetic}0-9](?:[a-zA-Z\p{Alphabetic}0-9\-]{0,61}[a-zA-Z\p{Alphabetic}0-9])?(?:\.[a-zA-Z\p{Alphabetic}0-9](?:[a-zA-Z\p{Alphabetic}0-9\-]{0,61}[a-zA-Z\p{Alphabetic}0-9])?)+$/u,
	"formatLienLinkedIn": /^https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+$/,
	"formatLienPersonneViadeo": /^https?:\/\/(?:viadeo.journaldunet|(?:[a-z]{2}\.)?viadeo)\.com\/p\/[a-zA-Z0-9\-]+$/,
	"formatLienEntrepriseViadeo": /^https?:\/\/(?:viadeo.journaldunet|(?:[a-z]{2}\.)?viadeo)\.com\/e\/[a-zA-Z0-9\-]+$/,
	"formatNomUtilisateur": /^[a-zA-Z0-9\p{L}\p{M}\p{Pc}\p{Join_Control}\.]{4,32}$/u,

	// Les mêmes formats pour les <input> des vues
	"formatNomVue": "[a-zA-Z\\p{L}\\p{M}\\p{Pc}\\p{Join_Control}\\-‐'’ ]{2,255}",
	"formatNombreVue": "[0-9]+",
	"formatDateVue": "(?:0[1-9]|[12][0-9]|3[01])\\/(?:0[1-9]|1[012])\\/(?:[19[0-9]{2}|20[0-9]{2})",
	"formatPériodeVue": "(?:0[1-9]|[12][0-9]|3[01])/(?:0[1-9]|1[012])/(?:19[0-9]{2}|20[0-9]{2}) - (?:0[1-9]|[12][0-9]|3[01])/(?:0[0-9]|1[012])/(?:19[0-9]{2}|20[0-9]{2})",
	"formatIntituléVue": "[a-zA-Z\\p{L}\\p{M}\\p{Pc}\\p{Join_Control}\\p{P}\\p{N}\\-‐ ]{2,1023}",
	"formatAdresseMélVue": "[a-zA-Z\\p{Alphabetic}0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z\\p{Alphabetic}0-9](?:[a-zA-Z\\p{Alphabetic}0-9\\-]{0,61}[a-zA-Z\\p{Alphabetic}0-9])?(?:\\.[a-zA-Z\\p{Alphabetic}0-9](?:[a-zA-Z\\p{Alphabetic}0-9\\-]{0,61}[a-zA-Z\\p{Alphabetic}0-9]))+",
	"formatNuméroTéléphoneVue": "\\+[1-9][0-9]{1,14}",
	"formatCodePostalVue": "[A-Z0-9][A-Z0-9 -]{0,10}[A-Z0-9]",
	"formatLienSiteVue": "https?:\\/\\/[a-zA-Z\\p{Alphabetic}0-9]([a-zA-Z\\p{Alphabetic}0-9\\-]{0,61}[a-zA-Z\\p{Alphabetic}0-9])?(?:\\.[a-zA-Z\\p{Alphabetic}0-9]([a-zA-Z\\p{Alphabetic}0-9\\-]{0,61}[a-zA-Z\\p{Alphabetic}0-9]))+",
	"formatLienLinkedInVue": "https?:\\/\\/(?:www\\.)?linkedin\\.com\\/in\\/[a-zA-Z0-9\\-]+",
	"formatLienPersonneViadeoVue": "https?:\\/\\/(?:viadeo.journaldunet|(?:[a-z]{2}\\.)?viadeo)\\.com\\/p\\/[a-zA-Z0-9\\-]+",
	"formatLienEntrepriseViadeoVue": "https?:\\/\\/(?:viadeo.journaldunet|(?:[a-z]{2}\\.)?viadeo)\\.com\\/e\\/[a-zA-Z0-9\\-]+",
	"formatNomUtilisateurVue": "[a-zA-Z0-9\\p{L}\\p{M}\\p{Pc}\\p{Join_Control}\\.]{4,32}",

	// Autorise tous les caractères alphabétiques UTF‐8, interdit le reste
	"caractèresInterditsNomUtilisateur": /[^a-zA-Z\p{L}\p{M}\p{Pc}\p{Join_Control}]/gu,

	// Autorise tous les caractères espaces et saut de ligne
	"formatChaineVide": /^\s*$/u,

	"formatsPhotographie": [  "image/gif", "image/jpeg", "image/png", "image/webp", ],
	"formatsLogotype": [ "image/gif", "image/jpeg", "image/png", "image/svg+xml", "image/webp", ],
	"formatsCV": [ "application/pdf", ],
	"formatsFichierOffre": [ "application/pdf", ],
	"formatsOffre": [ "application/pdf", ],

	"extensionsMIMETypes": {
		"image/gif": ".gif",
		"image/png": ".png",
		"image/jpeg": ".jpg",
		"image/webp": ".webp",
		"image/svg+xml": ".svg",
		"application/pdf": ".pdf",
	},

	"tailleFichierMaximale": 4_194_304, // octets soit 4,00Mio (4,19Mo)

	"duréeJours": {
		"semaine": 7,
		"mois": 30,
		"année": 365,
	},

	// Pour le chiffrage des mots de passe
	"degréSalage": 10,
	"nombreRésultatsParPage": 10,
}
