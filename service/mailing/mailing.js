const sgMail = require('@sendgrid/mail').setApiKey(
	process.env.SENDGRID_API_KEY ||
		'SG.miIyZL2eSCijuAmOll_AzQ.BlEDOzw5hVYVEhh32ZslSjmO1P-mTHAV6iGBemsYBCs'
)

const { emailObject } = require('./emailConstants')

/**
 * SendGrid email system
 * @param {boolean} welcome is it a welcome email
 * @param {string} receiver the person who gets the mail
 * @param {string} subject email subject
 * @param {string} type email type
 * @param {object} data dynamic data (variables)
 *
 */

function sendMail(welcome = false, receiver, subject, type, data) {
	const msg = {
		to: receiver, // Change to your recipient
		from: process.env.SENDER_ADDRESS,
		subject
	}

	sgMail
		.send({
			...msg,
			templateId: welcome
				? 'd-0df17641d9204673816e0208e6674f50'
				: process.env.EMAIL_TEMPLATE,
			dynamicTemplateData: {
				subject,
				...emailObject({ ...data, type })
			}
		})
		.then(() => {
			console.log(`Sending mail of type ${type} to: ${receiver}`)
		})
		.catch(error => {
			console.error({ error })
		})
}

async function systemMail({
	to = process.env.SENDER_ADDRESS,
	from = process.env.SENDER_ADDRESS,
	subject,
	text,
	sender
}) {
	await sgMail
		.send({ to, from, subject, text })
		.then(() => console.log(`${from} sends email to ${to}`))
		.catch(err => console.log(err.response.body))
}

module.exports = { sendMail, systemMail }
