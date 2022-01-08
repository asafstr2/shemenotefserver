const app = require('../server') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
const db = require('./db')
const DB = require('../models')
const thisUser = {
	username: 'Zell',
	email: 'testing@gmail.com',
	password: '12345'
}
const thisPost = {
	listingType: 'products',
	title: 'asd',
	desc: 'asd',
	tags: 'Food',
	loan: 'false',
	location: '{"type":"Point","coordinates":[]}',
	address: 'online',
	city: '',
	links: '',
	public_id: '',
	type: '1'
}
const saveUserToDb = async (user = thisUser) => {
	return await request.post('/api/auth/signup').send(user)
}
beforeAll(async () => await db.connect())
afterAll(async () => await db.clearDatabase())
afterAll(async () => await db.closeDatabase())

describe('testing update and delete user', () => {
	let token
	let id
	beforeAll(async () => {
		const user = await saveUserToDb(thisUser)
		token = `Bearer ${user.body.token}`
		id = user.body.id
	})
	afterAll(async () => await db.clearDatabase())
	test('is user in database?', async () => {
		expect.assertions(2)
		try {
			const testUser = await DB.User.findOne({ email: thisUser.email })
			expect(testUser.username).toEqual(thisUser.username)
			expect(testUser.email).toEqual(thisUser.email)
		} catch (error) {}
	})

	test('post message to db for this user', async () => {
		expect.assertions(4)
		const res = await request
			.post(`/api/users/${id}/messeges`)
			.send(thisPost)
			.set({ Authorization: token })
		expect(res.status).toEqual(200)
		expect(res.body.user._id).toEqual(id)
		const testUser = await DB.User.findOne({ email: thisUser.email })
		const testmessage = await DB.Message.findOne({ id: res.id })
		expect(testmessage).toBeTruthy()
		expect(testUser.messages.length).toEqual(1)
	})

	test('should delete user', async () => {
		expect.assertions(4)
		const res = await request
			.delete(`/api/users/${id}/edit`)
			.set({ Authorization: token })
		expect(res.status).toEqual(200)
		expect(res.body.deletedCount).toEqual(1)
		const testUser = await DB.User.findOne({ email: thisUser.email })
		expect(testUser).toBeNull()
		const testmessage = await DB.Message.findOne({ title: thisPost.title })
        expect(testmessage).toBeNull()

	})
	test('should get error that user deleted', async () => {
		expect.assertions(2)
		const res = await request
			.delete(`/api/users/${id}/edit`)
			.set({ Authorization: token })
		expect(res.status).toEqual(404)
		expect(res.body.error.message).toEqual('no user exists')
	})
})
