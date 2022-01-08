//function to handle Error presentation will present it in a form of nice Json for front End to grab and display
var PrettyError = require('pretty-error')
var pe = new PrettyError()

const errorHandler = (err, req, res, next) => {
	if (process.env.NODE_ENV !== 'test') {
		console.log(pe.render(err))
	}
	let messagePerStatus = {
		404: 'not found',
		401: 'no authorization'
	}
	let message = messagePerStatus[err.status]
	return res
		.status(err.status || 500)
		.json({
			error: { message: message || err.message || 'oops something went wrong' }
		})
}

module.exports = errorHandler
