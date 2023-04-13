const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.SENDER_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	}
})

exports.sendTextEmail = async options => {
	const mailOptions = {
		from: process.env.SENDER_ADDRESS,
		to: process.env.SENDER_ADDRESS,
		subject: 'Sending Email using Node.js',
		text: 'That was easy!',
		...options
	}
	try {
		const info = await transporter.sendMail(mailOptions)
		console.log('Email sent: ' + info.response)
	} catch (error) {
		console.log(error)
	}
}

exports.sendHtmlEmail = async options => {
	const mailOptions = {
		from: process.env.SENDER_ADDRESS,
		to: process.env.SENDER_ADDRESS,
		subject: 'Sending Email using Node.js',
		html: '<div>That was easy!</div>',
		...options
	}
	try {
		const info = await transporter.sendMail(mailOptions)
		console.log('Email sent: ' + info.response)
	} catch (error) {
		console.log(error)
	}
}
