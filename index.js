require('dotenv').config()
const app = require('./server.js')
const { webpushconfig } = require('./handlers/webPush')
const dbConnection = require('./models/dbConnection')
const PORT = process.env.PORT || 8082

webpushconfig()
// ----------------socketio definition--------------------------------

const server = app.listen(PORT, () =>
	console.log(`server is running on port ${PORT}`)
)
