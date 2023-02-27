const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//user schema consist of email userName profile image and encripted password with a method comparePassword that returns a boolian
const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			index: true
		},
		firstName: {
			type: String
		},
		lastName: {
			type: String
		},
		username: {
			type: String,
			unique: true
		},
		password: {
			type: String
			// required: true,
		},
		passwordReset: {
			type: String
			// required: true,
		},
		gender: {
			type: String
		},
		birthday: {
			type: Date,
			default: Date.now()
		},

		profileImageUrl: {
			type: String
		},
		public_id: {
			type: String
		},
		invitedBy: {
			type: mongoose.Types.ObjectId,
			ref: 'User'
		},
		//for admin in later on
		roles: [String],
		facebookId: { type: String, default: '' },
		facebook: { type: mongoose.Schema.Types.Mixed },
		googleId: { type: String, default: '' },
		google: { type: mongoose.Schema.Types.Mixed },
		address: { type: String },

		friendsInvited: [{ type: mongoose.Types.ObjectId, ref: 'User' }],

		notifications: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Notifications'
			}
		],
		pushNotificationEndPoints: [],
		paymentsimade: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Payments'
			}
		],
		paymentsirecived: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Payments'
			}
		],

		productPurchased: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Products'
			}
		],
		orders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Orders'
			}
		]
	},

	{
		timestamps: true
	}
)

//password is a string on schema and will be encrpted by this async function and save the encryption version to DB this function running pre export and model creating
userSchema.pre('save', async function (next) {
	try {
		const salt = await bcrypt.genSalt(parseInt(process.env.SALT_WORK_FACTOR))
		if (
			!this.isModified('password') &&
			!this.isModified('facebookId') &&
			!this.isModified('googleId')
		)
			return next()
		if (this.isModified('password') && this.password.length >= 1) {
			let hashedPassword = await bcrypt.hash(this.password, salt)
			this.password = hashedPassword
		}
		if (
			this.facebookId &&
			this.isModified('facebookId') &&
			this.facebookId.length >= 1
		) {
			let hashedPassword = await bcrypt.hash(this.facebookId, salt)
			this.facebookId = hashedPassword
		}
		if (
			this.googleId &&
			this.googleId.length >= 1 &&
			this.isModified('googleId')
		) {
			let hashedPassword = await bcrypt.hash(this.googleId, salt)
			this.googleId = hashedPassword
		}

		return next()
	} catch (error) {
		return next(error)
	}
})

// adding a method to Schema for comparing password this method will return a boolian or error
userSchema.methods.comparePassword = async function (candidatePassword, next) {
	try {
		return await bcrypt.compare(candidatePassword, this.password)
	} catch (error) {
		return next(error)
	}
}
//return empty if no facebook id for that user or true if facebook id matches our records and false if it doesnt
userSchema.methods.comparFacebookId = async function (candidateId, next) {
	try {
		let isMatch = 'empty'
		if (this.facebookId.length > 1)
			isMatch = await bcrypt.compare(candidateId, this.facebookId)
		return isMatch
	} catch (error) {
		return next(error)
	}
}
//return empty if no google id for that user or true if google id matches our records and false if it doesnt

userSchema.methods.comparGoogleId = async function (candidateId, next) {
	try {
		let isMatch = 'empty'
		if (this.googleId.length > 1)
			isMatch = await bcrypt.compare(candidateId, this.googleId)
		// let isMatch = Boolean(candidateId === this.googleId);
		return isMatch
	} catch (error) {
		return next(error)
	}
}

userSchema.methods.updateCredentials = async function (
	Credentials,
	field,
	next
) {
	try {
		switch (field) {
			case 'password':
				this.password = Credentials
				break
			case 'facebookId':
				this.facebookId = Credentials
				break
			case 'googleId':
				this.googleId = Credentials
				break
			default:
				break
		}
	} catch (error) {
		return next(error)
	}
}

userSchema.methods.validatePassword = async function validatePassword(data) {
	return await bcrypt.compare(data, this.password)
}
userSchema.methods.filterResponseForClient = function validatePassword(
	fields = []
) {
	userobj = this.toObject()
	const doNotIncludeInResponse = [
		'password',
		'facebookId',
		'facebook',
		'googleId',
		'google',
		'paymentsimade',
		'paymentsirecived',
		'productPurchased',
		'invitedBy',
		'pushNotificationEndPoints',
		'friendsInvited',
		...fields
	]
	doNotIncludeInResponse.forEach(valToDelete => delete userobj[valToDelete])
	return { ...userobj, id: userobj._id }
}

//creating the schema
const User = mongoose.model('User', userSchema)

module.exports = User
