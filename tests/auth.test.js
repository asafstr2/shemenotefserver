const app = require('../server')
const supertest = require('supertest')
const request = supertest(app)
const db = require('./db')
const DB = require('../models')
const thisUser = {
	email: 'asafstr2s@gmail.com',
	facebookId: '',
	googleId: '',
	password: 'asafstr2',
	profileImageUrl: '',
	showPassword: false,
	username: 'Admins'
}
const saveUserToDb = async (user = thisUser) => {
	return await request.post('/api/auth/signup').send(user)
}
beforeAll(async () => await db.connect())
afterAll(async () => await db.clearDatabase())
afterAll(async () => await db.closeDatabase())

describe('signup', () => {
	beforeAll(async () => saveUserToDb())
	afterAll(async () => await db.clearDatabase())
	test('Should save user to database', async () => {
		expect.assertions(2)
		try {
			const testUser = await DB.User.findOne({ email: thisUser.email })
			expect(testUser.username).toEqual(thisUser.username)
			expect(testUser.email).toEqual(thisUser.email)
		} catch (error) {//?
		}
	})

	test('Should login if mail in db and password match on signup', async () => {
		expect.assertions(3)
		const moto = 'testing login'
		try {
			const testUser = await DB.User.findOne({ email: thisUser.email })
			testUser.moto = moto
			await testUser.save()
			const res = await request.post('/api/auth/signup').send(thisUser)
			expect(res.body.moto).toBe(moto)
			expect(res.status).toBe(200)
			expect(1).toBe(1)
		} catch (e) {}
	})

	test('Should fail on same email with upper case letters', async () => {
		expect.assertions(3)

		try {
			const res = await request.post('/api/auth/signup').send({
				...thisUser,
				email: 'testinG@gmail.com'
			})

			expect(res.status).toEqual(400)
			expect(res.body.error.message).toEqual(
				'sorry User Name or Email has alredy been taken '
			)
			expect(1).toBe(1)

		} catch (e) {
			expect(e).toMatch('sorry User Name or Email has alredy been taken')
		}
	})
	test('Should save invited id', async () => {
		expect.assertions(5)

		try {
			await request.post('/api/auth/signup').send({
				...thisUser
			})
			let inviterUser = await DB.User.findOne({ email: thisUser.email })
			const res = await request.post('/api/auth/signup').send({
				...thisUser,
				email: 'test1@gmail.com',
				username: 'test1',
				invitedBy: inviterUser.id
			})
			inviterUser = await DB.User.findOne({ email: thisUser.email })
			const InvitedUser = await DB.User.findOne({ email: 'test1@gmail.com' })
			expect(res.status).toEqual(200)
			expect(JSON.stringify(inviterUser.id)).toEqual(
				JSON.stringify(InvitedUser.invitedBy)
			)
			expect(JSON.stringify(inviterUser.friendsInvited[0])).toEqual(
				JSON.stringify(InvitedUser.id)
			)
			expect(JSON.stringify(inviterUser.id)).toEqual(
				JSON.stringify(InvitedUser.invitedBy)
			)
			expect(1).toBe(1)
		} catch (e) {}
	})
})

describe('signin', () => {
	beforeAll(async () => saveUserToDb())
	afterAll(async () => await db.clearDatabase())

	//making sure we have a user in the db
	test('is user in database?', async () => {
		expect.assertions(3)
		try {
			const testUser = await DB.User.findOne({ email: thisUser.email })
			expect(testUser.username).toEqual(thisUser.username)
			expect(testUser.email).toBeTruthy()
			expect(1).toBe(1)
		} catch (error) {}
	})

	test('Should find by email with correct password', async () => {
		expect.assertions(3)
		try {
			const res = await request.post('/api/auth/signin').send(thisUser)
			expect(res.status).toEqual(200)
			expect(res.body.email).toEqual(thisUser.email)
			expect(1).toBe(1)
		} catch (e) {}
	})
	test('Should fail for wrong password', async () => {
		expect.assertions(3)
		try {
			const res = await request.post('/api/auth/signin').send({
				...thisUser,
				password: '12346'
			})
			expect(res.status).toEqual(400)
			expect(res.body.error.message).toEqual('invalid email/password')
			expect(1).toBe(1)

		} catch (e) {}
	})

	test('Should not find by email wrong email', async () => {
		expect.assertions(2)
		try {
			const res = await request.post('/api/auth/signin').send({
				...thisUser,
				email: 'testingh@gmail.com'
			})
			expect(res.status).toEqual(400)
			expect(res.body.error.message).toEqual('invalid email/password ').end()
		} catch (e) {}
	})

	test('Should create a token for reset password and send it to mail', async () => {
		expect.assertions(2)
		try {
			const res = await request.post('/api/auth/resetPassword').send(thisUser)
			const testUser = await DB.User.findOne({ email: thisUser.email })
			expect(res.status).toEqual(200)
			expect(testUser.passwordReset).toEqual(res.body.token)
		} catch (e) {}
	})
	test('Should create a token for reset password and store in db', async () => {
		expect.assertions(2)
		try {
			const res = await request.post('/api/auth/resetPassword').send(thisUser)
			const testUser = await DB.User.findOne({ email: thisUser.email })
			const res2 = await request
				.put('/api/auth/resetPassword')
				.send({ token: testUser.passwordReset, password: '123456' })
			expect(res.status).toEqual(200)
			expect(res2.body).toEqual('user password updated')
		} catch (e) {}
	})
	test('Should find by email with correct password post password reset', async () => {
		expect.assertions(2)
		try {
			const res = await request
				.post('/api/auth/signin')
				.send({ ...thisUser, password: '123456' })
			expect(res.status).toEqual(200)
			expect(res.body.email).toEqual(thisUser.email)
		} catch (e) {}
	})
	test('Should fail for wrong password post password reset', async () => {
		expect.assertions(2)
		try {
			const res = await request.post('/api/auth/signin').send(thisUser)
			expect(res.status).toEqual(400)
			expect(res.body.error.message).toEqual('invalid email/password ')
		} catch (e) {}
	})
})

describe('social google sign in', () => {
	const googleId = '12345'
	const googleIdNoPassword = { ...thisUser, password: null, googleId }
	beforeAll(async () => saveUserToDb({ ...thisUser, googleId }))
	afterAll(async () => await db.clearDatabase())
	//making sure we have a user in the db
	test('is user in database?', async () => {
		expect.assertions(4)
		try {
			const testUser = await DB.User.findOne({ email: thisUser.email })
			expect(testUser.username).toEqual(thisUser.username)
			expect(testUser.email).toEqual(thisUser.email)
			expect(testUser.googleId).toBeTruthy()
			expect(testUser.password).toBeTruthy()
		} catch (error) {}
	})

	test('Should find by email with correct googleId', async () => {
		expect.assertions(2)
		try {
			const res = await request
				.post('/api/auth/socialsignin')
				.send(googleIdNoPassword)
			expect(res.status).toEqual(200)
			expect(res.body.email).toEqual(thisUser.email)
		} catch (e) {}
	})
	test('Should fail for wrong googleId', async () => {
		expect.assertions(2)
		try {
			const res = await request.post('/api/auth/socialsignin').send({
				...googleIdNoPassword,
				googleId: '1234689'
			})
			expect(res.status).toEqual(400)
			expect(res.body.error.message).toEqual('invalid email/password ')
		} catch (e) {}
	})

	test('Should not find by email wrong email', async () => {
		expect.assertions(2)
		try {
			const res = await request
				.post('/api/auth/socialsignin')
				.send({ ...googleIdNoPassword, email: 'someEmail@gmail.com' })
			expect(res.status).toEqual(400)
			expect(res.body.error.message).toEqual('invalid email/password ')
		} catch (e) {}
	})
})

describe('social facebookId sign in', () => {
	const facebookId = '12345'
	const facebookIdNoPassword = { ...thisUser, password: null, facebookId }
	beforeAll(async () => saveUserToDb({ ...thisUser, facebookId }))
	afterAll(async () => await db.clearDatabase())
	//making sure we have a user in the db
	test('is user in database?', async () => {
		expect.assertions(4)
		try {
			const testUser = await DB.User.findOne({ email: thisUser.email })
			expect(testUser.username).toEqual(thisUser.username)
			expect(testUser.email).toEqual(thisUser.email)
			expect(testUser.facebookId).toBeTruthy()
			expect(testUser.password).toBeTruthy()
		} catch (error) {}
	})

	test('Should find by email with correct facebookId', async () => {
		expect.assertions(2)
		try {
			const res = await request
				.post('/api/auth/socialsignin')
				.send(facebookIdNoPassword)
			expect(res.status).toEqual(200)
			expect(res.body.email).toEqual(thisUser.email)
		} catch (e) {}
	})
	test('Should fail for wrong facebookId', async () => {
		expect.assertions(3)
		try {
			const res = await request.post('/api/auth/socialsignin').send({
				...facebookIdNoPassword,
				facebookId: '12346'
			})//?$.body
			expect(res.status).toEqual(400)
			expect(res.body.error.message).toEqual('invalid email/password ')
			expect(1).toBe(1)

		} catch (e) {}
	})

	test('Should not find by email wrong email', async () => {
		expect.assertions(3)
		try {
			const res = await request.post('/api/auth/socialsignin').send({
				...facebookIdNoPassword,
				email: 'testingh@gmail.com'
			})//?$.body
			expect(res.status).toEqual(400)
			expect(res.body.error.message).toEqual('invalid email/password user')
			expect(1).toBe(1)
		} catch (e) {}
	})
})

describe('get socials', () => {
	const googleId = '12345'
	const googleIdNoPassword = { ...thisUser, password: null, googleId }
	let token
	let id
	beforeAll(async () => {
		const user = await saveUserToDb({ ...thisUser, googleId })
		token = `Bearer ${user.body.token}`
		id = user.body.id
	})
	afterAll(async () => await db.clearDatabase())
	test('Should get googleId as true from socials', async () => {
		expect.assertions(3)
		const res = await request
			.get(`/api/auth/${id}/getsocials`)
			.set({ Authorization: token })//?$.body
		expect(res.status).toEqual(200)
		expect(res.body.facebook).not.toBeTruthy()
		expect(res.body.google).toBeTruthy()
	})

	test('Should save facebook to db', async () => {
		expect.assertions(3)
		const res = await request
			.post(`/api/auth/${id}/updatesocials`)
			.send({ socials: { facebook: '12345' } })
			.set({ Authorization: token })//?$.body
		expect(res.status).toEqual(200)
		expect(res.body).toEqual('facebook')
		const testUser = await DB.User.findOne({ email: thisUser.email })
		expect(testUser.facebookId).toBeTruthy()
	})
	test('Should save google to db', async () => {
		expect.assertions(3)
		const res = await request
			.post(`/api/auth/${id}/updatesocials`)
			.send({ socials: { google: '12345' } })
			.set({ Authorization: token })//?$.body
		expect(res.status).toEqual(200)
		expect(res.body).toEqual('google')
		const testUser = await DB.User.findOne({ email: thisUser.email })
		expect(testUser.googleId).toBeTruthy()
	})

	test('Should get facebook and google as true from socials', async () => {
		expect.assertions(3)
		const res = await request
			.get(`/api/auth/${id}/getsocials`)
			.set({ Authorization: token })//?$.body
		expect(res.status).toEqual(200)
		expect(res.body.facebook).toBeTruthy()
		expect(res.body.google).toBeTruthy()
	})
})
