import mongoose from 'mongoose'

//user schema consist of email userName profile image and encripted password with a method comparePassword that returns a boolian
const ProductsToDeliverSchema = new mongoose.Schema(
	{
		products: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'Products'
			}
		],
		purchesedBy: {
			type: mongoose.Types.ObjectId,
			ref: 'User'
		},
		address: {
			type: String
		},
		phone: {
			type: String
		},
		timesPurchesed: {
			type: String
		}
	},

	{
		timestamps: true
	}
)

module.exports = mongoose.model('ProductsToDeliver', ProductsToDeliverSchema)
