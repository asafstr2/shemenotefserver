const db = require('../models')
const { systemMail } = require('../service/mailing/mailing')

exports.contactUs = async (req, res, next) => {
	try {
		const { from, subject, text } = req.body
		await systemMail({ subject, text, sender: from })
		res.status(200).json('Mail was sent')
	} catch (err) {
		next(err)
	}
}

exports.report = async (req, res, next) => {
	try {
		const { issue, contactMethod, number, from, mid } = req.body
		const { id } = req.params
		let reporter = await db.User.findById(id)
		await systemMail({
			subject: `Report from ${reporter.email}`,
			text: `issue: ${issue}\n${
				mid ? 'message id: ' + mid : ''
			}\nPreferred contact method: ${contactMethod}\n${
				number ? 'Phone Number: ' + number : ''
			}`,
			from
		})
		res.status(200).json('Mail was sent')
	} catch (err) {
		next(err)
	}
}
