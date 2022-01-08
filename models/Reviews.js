const mongoose = require('mongoose')

//user schema consist of email userName profile image and encripted password with a method comparePassword that returns a boolian
const ReviewsSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true
		},
		description: {
			type: String
		},
		image: {
			type: String
		},
		author: {
			type: mongoose.Types.ObjectId,
			ref: 'User'
		}
	},

	{
		timestamps: true
	}
)

module.exports = mongoose.model('Reviews', ReviewsSchema)
