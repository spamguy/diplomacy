var mongoose = require('mongoose');

var VariantSchema = new mongoose.Schema({
	displayName: String,
	packageName: String,
	centresToWin: Number,
	startYear: Number,

	/*
	 * All regions on the map.
	 * Regions with multiple coastlines (St. Petersburg comes to mind) should be listed multiple times with different names and keys but a common group name.
	 */
	regions: [{
			name: String,								// the full name of the region; e.g., Sevastopol. User-facing
			key: String,								// the short (traditionally three-letter) code; e.g., SEV or sev. Case insensitive
			group: String,								// the group name -- usually optional
			isSupplyCentre: Boolean,
			borders: [{
					region: String,						// see regions[].key
					regiontype: {
						type: String,
						enum: 'L W C'.split(' ')		// -> { land, water, coast }
					}
				}
			]
		}
	],

	/*
	 * Desscription of players needed and their starting positions.
	 */
	 powers: [{
	 		name: String,								// the full name of the power
	 		code: String,								// the one-letter representation. If not provided the first character of powers[].name will be used
	 		colour: String,								// the colour to paint units, expressed as '#ABCABC'
	 		start: [{									// an array of regions or groups in which player starts game
	 				region: String      				// see regions[].key
	 			}
 			]
 		}
	]
});

var Variant = mongoose.model('Variant', VariantSchema);

module.exports = {
  Variant: Variant
};