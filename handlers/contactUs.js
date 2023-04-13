const db = require('../models')
const { sendHtmlEmail } = require('../service/mailing/mail')

exports.contactUs = async (req, res, next) => {
	try {
		const { from, subject, text } = req.body
		// await systemMail({ subject, text, sender: from })
		res.status(200).json('Mail was sent')
	} catch (err) {
		next(err)
	}
}

exports.report = async (req, res, next) => {
	try {
		const { name, report, phone, email } = req.body
		const { id } = req.params
		let reporter = await db.User.findById(id)
		const message = {
			subject: ' צור קשר',
			html: `	<div>
					<h1>
						${reporter.username}/ ${name} שואל
					</h1>
					<br />
					<br />
					<p>${report}</p>
					<br />
					<br />
					<p> ${phone}    השב במספר</p>
					<p> ${reporter.email}  /   ${email}     או במייל  </p>
				</div>`
		}
		await sendHtmlEmail(message)

		res.status(200).json('Mail was sent')
	} catch (err) {
		next(err)
	}
}
