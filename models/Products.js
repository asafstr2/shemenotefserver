const mongoose = require('mongoose')
var min = [
	0,
	'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'
]
var max = [5, 'The value of path `{PATH}` ({VALUE}) exceeds the limit ({MAX}).']
const ProductsSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			unique: true
		},
		otherLanguageTitle: {
			hebrew: { type: String },
			russian: { type: String },
			default: {
				type: String,
				default: function () {
					return this.title
				}
			}
		},
		description: {
			type: String,
			required: true
		},
		ingredients: { type: String },

		otherLanguageDescription: {
			hebrew: { type: String },
			russian: { type: String },
			default: {
				type: String,
				default: function () {
					return this.description
				}
			}
		},
		image: {
			type: String,
			required: true,
			default: function () {
				return this?.images[0]?.secure_url
			}
		},
		images: [],

		quantetyInStock: {
			type: Number,
			min: min,
			default: 0
		},
		featured: {
			type: Boolean,
			default: false
		},
		outOfStock: {
			type: Boolean,
			default: false
		},
		listed: {
			type: Boolean,
			default: false
		},
		availibleForDelivery: {
			type: Boolean,
			default: false
		},
		deliveryDate: {
			type: Date
		},
		size: {
			type: String,
			default: '0'
		},
		category: {
			type: mongoose.Types.ObjectId,
			ref: 'Categories'
		},
		brand: {
			type: String,
			default: 'general'
		},
		location: {
			type: String,
			default: 'shaked 24'
		},
		price: {
			value: { type: Number, default: 0, min: min },
			currency: { type: String, default: '₪' }
		},
		quantity: {
			value: { type: Number, default: 0, min: min },
			currency: { type: String, default: 'g' }
		},
		rating: {
			rate: { type: Number, default: 0, min: min, max: max },
			count: { type: Number, default: 0, min: min }
		},
		discount: {
			type: Number,
			default: 0,
			min: min
		},
		Reviews: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'Reviews'
			}
		],
		timesPurchesed: {
			type: String
		},
		discountedPrice: {
			type: Number,
			default: function () {
				if (this.price > 0 && this.price > this.discount) {
					return this.price - this.discount
				}
				return 0
			}
		}
	},

	{
		timestamps: true
	}
)

ProductsSchema.pre('save', async function (next) {
	try {
		if (!this.isModified('price') || !this.isModified('discount')) return next()
		if (this.price > 0 && this.price > this.discount) {
			this.discountedPrice = this.price - this.discount
			return next()
		}
		this.discountedPrice = 0
		return next()
	} catch (error) {
		throw new Error(error)
	}
})

module.exports = mongoose.model('Products', ProductsSchema)
