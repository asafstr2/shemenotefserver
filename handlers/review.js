const db = require('../models')

exports.createReview = async (req, res, next) => {
	try {
		let { role, reviewer, reviewee, hours, overall,text } = req.body
		req.body.hours= parseFloat(hours)
		let newReview = overall || text ? await db.Review.create(req.body) : null
		let reviewerUser = await db.User.findById(reviewer)
		let revieweeUser = await db.User.findById(reviewee)
		revieweeUser.stats.overall += parseFloat(overall)
		if (role === 0 || !role) {
			reviewerUser.stats.hoursReceived += parseFloat(hours)
			revieweeUser.stats.hoursSpent += parseFloat(hours)
		}
		// doesnt work. use different update method
		await db.User.findByIdAndUpdate(reviewer, { stats: reviewerUser.stats })
		await db.User.findByIdAndUpdate(reviewee, { stats: revieweeUser.stats })
		res.json(newReview)
	} catch (err) {
		next(err)
	}
}

exports.fetchUserReviews = async (req, res, next) => {
	try {
		let { uid } = req.params
		let userReviews = await db.Review.find({ reviewee: uid })
			.sort({ createdAt: 'desc' })
			.populate({
				path: 'reviewer',
				select: 'username profileImageUrl'
			})
		res.json(userReviews)
	} catch (err) {
		next(err)
	}
}
