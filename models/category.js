const mongoose = require('mongoose')

const CategoriesSchema = new mongoose.Schema(
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
		images: [],
		image: {
			type: String,
			required: true,
			default: function () {
				return this?.images[0]?.secure_url
			}
		},

		Products: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'Products'
			}
		]
	},

	{
		timestamps: true
	}
)

module.exports = mongoose.model('Categories', CategoriesSchema)
