const mongoose = require('mongoose')
// jest.useFakeTimers();
const { MongoMemoryServer } =require ('mongodb-memory-server')
const mongoServer = new MongoMemoryServer()
mongoose.Promise = Promise

module.exports.connect = async () => {
	mongoServer.getUri().then(mongoUri => {
		const mongooseOpts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
		}
		mongoose.connect(mongoUri, mongooseOpts)
		mongoose.connection.on('error', e => {
			if (e.message.code === 'ETIMEDOUT') {
				console.log(e)
				mongoose.connect(mongoUri, mongooseOpts)
			}
			console.log(e)
		})
		// mongoose.connection.once('open', () => {
		// 	console.log(`MongoDB successfully connected to ${mongoUri}`)
		// })
	})
	module.exports.closeDatabase = async () => {
		await mongoose.connection.dropDatabase()
		await mongoose.connection.close()
		await mongoServer.stop()
	}
	module.exports.clearDatabase = async () => {
        const collections = Object.keys(mongoose.connection.collections)
        for (const collectionName of collections) {
          const collection = mongoose.connection.collections[collectionName]
          await collection.deleteMany()
        }
    }
}
