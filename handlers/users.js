const db = require('../models')
const { cloudinary } = require('../routes/cloudineryCfg')
const jwt = require('jsonwebtoken')
const {
	registerUserToNotifications,
	sendNotificationToUser
} = require('./webPush')

exports.getUserById = async (req, res, next) => {
	let { id } = req.params
	try {
		let foundUser = await db.User.findById(id).populate({
			path: 'pendingReviews',
			select: 'name date users',
			populate: {
				path: 'users',
				select: 'hasReviewed text overall',
				populate: {
					path: 'user',
					select: 'username profileImageUrl'
				}
			}
		})
		let {
			_id,
			username,
			profileImageUrl,
			stats,
			moto,
			pendingReviews,
			createdAt,
			address
		} = foundUser
		res.status(200).json({
			_id,
			username,
			profileImageUrl,
			pendingReviews,
			stats,
			moto,
			createdAt,
			address
		})
	} catch (err) {
		next(err)
	}
}

exports.editUser = async (req, res, next) => {
	let { user } = req // from the auth middleware preceding this (correctUser)
	let links = req.files.map(file => file.path)
	const oldLinks = req.body.oldLinks
	let public_id = req.files.map(file => file.filename)
	let { id } = req.params
	let new_user = req.body

	//if any images where uploaded from front end with multer
	//those are not combined to support legacy
	if (links.length > 0) {
		new_user.profileImageUrl = links[0]
		new_user.public_id = public_id[0]
	}

	let token = jwt.sign(
		{
			...user,
			...new_user
		},
		process.env.SECRET_KEY
	)

	try {
		let NewUser = await db.User.findByIdAndUpdate(id, new_user, { new: true })
		if (oldLinks && oldLinks.length > 0 && oldLinks !== '') {
			cloudinary.uploader.destroy(
				`shemen_otef/${oldLinks?.split('/')[8]?.split('.')[0]}`,
				function (error, result) {
					if (error) {
						console.log({ profileImageError: error })
						next(error)
					}
					console.log({ profileImageResult: result })
				}
			)
		}
		res.status(200).json({ NewUser, token })
	} catch (err) {
		next(err)
	}
}

exports.getAllUsers = async (req, res, next) => {
	try {
		let users = await db.User.find({})
		res.status(200).json(users)
	} catch (err) {
		next(err)
	}
}

exports.saveMessageToUser = async (req, res, next) => {
	try {
		let { user_id } = req.params
		let { messageToSave } = req.body
		await db.Message.findByIdAndUpdate(messageToSave, {
			// add user that liked to message - for popular search
			$push: { likedBy: user_id }
		})
		let updatedUser = await db.User.findByIdAndUpdate(
			user_id,
			{ $addToSet: { saved: messageToSave } },
			{ new: true }
		)
		res.status(200).json(updatedUser.saved)
	} catch (err) {
		next(err)
	}
}
exports.unsaveMessageToUser = async (req, res, next) => {
	try {
		let { user_id } = req.params
		let { messageToUnsave } = req.body
		await db.Message.findByIdAndUpdate(messageToUnsave, {
			$pull: { likedBy: user_id }
		})
		let updatedUser = await db.User.findByIdAndUpdate(
			user_id,
			{
				$pull: { saved: messageToUnsave }
			},
			{ new: true }
		)
		res.status(200).json(updatedUser)
	} catch (err) {
		next(err)
	}
}
exports.fetchSavedMessages = async (req, res, next) => {
	try {
		let { user_id } = req.params
		let foundUser = await db.User.findById(user_id, { saved: 1, _id: 0 })
		foundUser.populate({
			path: 'saved',
			select: 'type title desc address user links',
			populate: { path: 'user', select: 'username profileImageUrl' }
		})
		let { saved } = foundUser
		res.status(200).json(saved)
	} catch (err) {
		next(err)
	}
}

exports.fetchPendingReviews = async (req, res, next) => {
	try {
		let { user_id } = req.params
		let { pendingReviews } = await db.User.findById(user_id, {
			pendingReviews: 1,
			_id: 0
		}).populate({ path: 'pendingReviews', select: 'name date reviewd users' })
		res.status(200).json({ pendingReviews })
	} catch (err) {
		next(err)
	}
}

exports.fetchStats = async (req, res, next) => {
	try {
		let { user_id } = req.params
		let { stats } = await db.User.findById(user_id)
		res.status(200).json(stats)
	} catch (err) {
		next(err)
	}
}

exports.fetchUpcoming = async (req, res, next) => {
	try {
		let { user_id } = req.params

		let { upcoming } = await db.User.findById(user_id)
		res.status(200).json(upcoming)
	} catch (err) {
		next(err)
	}
}

exports.registerDeviceForNotification = async (req, res, next) => {
	try {
		const newSub = req.body.newSub
		const uid = req.body.userId
		let registration = await registerUserToNotifications(uid, newSub)
		return res.status(200).json(registration)
	} catch (err) {
		console.log(err)
		next(err)
	}
}

exports.deleteUser = async (req, res, next) => {
	try {
		const foundUser = await db.User.findById(req.user.id)
		const messages = foundUser.messages
		await db.Message.deleteMany({
			_id: {
				$in: messages
			}
		})
		const deleted = await db.User.deleteOne({ _id: req.user.id })
		return res.status(200).json(deleted)
	} catch (error) {
		console.log(error)
		next(error)
	}
}
