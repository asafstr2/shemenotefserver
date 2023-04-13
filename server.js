require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const errorHandler = require('./handlers/error')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const paymantRoutes = require('./routes/paymant')
const paymantSuccess = require('./routes/paymantSuccess')
const notificationRoutes = require('./routes/notification')
const contactUsRoutes = require('./routes/contactUs')
const productsRoutes = require('./routes/products')
const categoriesRoutes = require('./routes/categories')

const {
	loginRequired,
	ensureCorrectUser,
	viewOnly
} = require('./midlleware/auth')
//using cors to allow cross origin from diffrent port for front end to connect
//todo secure cors allow only front end
app.disable('etag')
// app.use("/public ", express.static(path.join(__dirname, "public")));
app.use(cors())

//using body parser json to send a json type req since it is api
app.use(bodyParser.json())
//using morgan for debagging
if (process.env.NODE_ENV !== 'test') {
	app.use(morgan('tiny'))
} // ------------------------------------------routes section----------------------------------------------------
if (process.env.NODE_ENV === 'dev') {
	app.get('/', function (req, res) {
		res.send({ message: process.env.NODE_ENV })
	})
}
if (process.env.NODE_ENV === 'test') {
	app.get('/test', function (req, res) {
		res.send({ message: 'pass!' })
	})
}
// app.use('/api/paymant/:id', paymantSuccess)
// app.use('/api/paymant/successhyp', paymantSuccess)

//authRoutes= login or signup so /api/auth/singup or /api/auth/login
app.use('/api/auth', authRoutes)

// using prefix /api/paymant/:id/create
app.use('/api/paymant/:id', loginRequired, ensureCorrectUser, paymantRoutes)
app.use('/api/products/', productsRoutes)
app.use('/api/categories/', categoriesRoutes)


app.use(
	'/api/users/:id/notifications',
	loginRequired,
	viewOnly,
	notificationRoutes
)
app.use('/api/users/', loginRequired, viewOnly, userRoutes)

//using error handler + error handler presenter
app.use('/api/contact/', loginRequired, contactUsRoutes)

app.use(errorHandler)

app.use(function (req, res, next) {
	res.status(404).send("Sorry can't find that!")
})
app.use((req, res, next) => {
	let err = new Error('not found')
	err.status = 404
	next(err)
})

module.exports = app
