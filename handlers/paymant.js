//to do create live keys and move them to ENV 

const stripe = require("stripe")(process.env.STRIPE);
const paypal3 = require('@paypal/checkout-server-sdk');
const paypal2 = require('@paypal/payouts-sdk');
const db = require('../models')
const buildUrl = require('../service/url/urlUtils')
const fetch = (...args) =>
	import('node-fetch').then(({ default: fetch }) => fetch(...args))

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT
const PAYPAL_SECRET = process.env.PAYPAL_SECRET
const BASE_URL = process.env.BASE_URL
// * This route uses SandboxEnvironment. In production, use LiveEnvironment.

const env = new paypal2.core.SandboxEnvironment(PAYPAL_CLIENT, PAYPAL_SECRET)
const client = new paypal2.core.PayPalHttpClient(env)

const itemize = objectArray => {
	// objectArray = [{ item: 'sss', quantity: 123, price: 12 }]
	return objectArray
		.map(
			(next, index) =>
				`[00${index + 1}~${next.item}~${next.quantity}~${next.price}]`
		)
		.join('')
}
function validateRequestBody(body, fields) {
	// Check if the body is a non-empty object
	if (
		typeof body !== 'object' ||
		Array.isArray(body) ||
		Object.keys(body).length === 0 ||
		fields.length === 0
	) {
		return { status: false, field: typeof body }
	}
	// Check if the required fields are present
	for (const field of fields) {
		if (!(field in body)) {
			return { status: false, field }
		}
	}

	return { status: true }
}

exports.successhyp = async (req, res, next) => {
	try {
		// const total = req.query.total
		// if (total > 0) {
		// 	const paymentIntent = await stripe.paymentIntents.create({
		// 		amount: total,
		// 		currency: 'usd'
		// 	})
		const params = req.params
		console.log({ paymantRecived: 'ok', params: req.params })
		res.status(201).send({
			test: 'ok'
		})
		// }
		//  else {
		// 	return next({
		// 		status: 400,
		// 		message: 'total cant be 0'
		// 	})
		// }
	} catch (error) {
		next(error)
	}
}
exports.createPaymant = async (req, res, next) => {
	try {
		const total = req.query.total
		if (total > 0) {
			const paymentIntent = await stripe.paymentIntents.create({
				amount: total,
				currency: 'usd'
			})
			res.status(201).send({
				clientSecret: paymentIntent.client_secret
			})
		} else {
			return next({
				status: 400,
				message: 'total cant be 0'
			})
		}
	} catch (error) {
		next(error)
	}
}

exports.createPaymanthyp = async (req, res, next) => {
	try {
		const userId = req.params.id
		const user = req.user
		const itemFiled = itemize([
			{ item: 'test1', quantity: '1', price: '2.0' },
			{ item: 'test2', quantity: '2', price: '4.0' }
		])
		console.log({ itemFiled })
		const requiredFields = [
			'ClientName',
			'ClientLName',
			'street',
			'city',
			'zip',
			'phone',
			'cell',
			'email'
		]
		const isreqFromClientValid = validateRequestBody(req.body, requiredFields)
		console.log({ isreqFromClientValid })
		if (!isreqFromClientValid.status) {
			return next({
				status: 400,
				message: `missing param ${isreqFromClientValid.field}`
			})
		}
		const serverPayParams = {
			action: 'APISign',
			What: 'SIGN',
			KEY: process.env.HYP_PAYMANT_API_KEY,
			PassP: process.env.HYP_PAYMANT_PassP_KEY,
			Masof: process.env.HYP_TERMINAL,
			Info: 'shemen-otef',
			UTF8: 'True',
			UTF8out: 'True',
			Sign: 'False',
			Amount: '10',
			Order: 'the product id/order id',
			Tash: '1',
			FixTash: 'True',
			tashType: '1',
			sendemail: 'asafstr2@gmail.com',
			MoreData: 'True',
			pageTimeOut: 'True',
			PageLang: 'HEB',
			tmp: '1',
			Coin: '1'
		}

		const invoiceParameters = {
			SendHesh: 'True',
			Pritim: 'True',
			// Requierd if Pritim equals True
			heshDesc: itemFiled
		}

		const url = buildUrl('https://icom.yaad.net/p/', {
			queryParams: { ...serverPayParams, ...invoiceParameters, ...req.body }
		})
		const response = await fetch(url)
		const body = await response.text()
		const returnedParams = body
		const paytmantUrl = `https://icom.yaad.net/p/?action=pay&${returnedParams}`

		console.log({ url, returnedParams })
		// res.redirect(paytmantUrl)
		res.status(201).send({
			paytmantUrl
		})
	} catch (error) {
		next(error)
	}
}

exports.PaypalcreatePaymant = async (req, res, next) => {

  try {
    req.app.locals.url = req.body.sucessURL
    let userId = req.params.id
    let receiverid = req.params.receiverid
    let foundUser = await db.User.findById(userId)
    let foundrecipient = await db.User.findById(receiverid)
    const { value, currency_code, cancelUrl } = req.body
    req.app.locals.receiverid = receiverid
    req.app.locals.userId = userId
    req.app.locals.value = value
    if (!foundUser || !foundrecipient)
      return next({ message: "one of the users is not registered" })

    let request = new paypal3.orders.OrdersCreateRequest();
    request.requestBody({
      "intent": "CAPTURE",

      "application_context": {
        "return_url": `${BASE_URL}/api/paymant/${userId}/success/${receiverid}/${currency_code}/${value}`,
        "cancel_url": `${process.env.FRONT_BASE_URL}${cancelUrl}` // this is failing for some reason
      },
      "purchase_units": [
        {
          "amount": {
            "currency_code": currency_code,
            "value": value
          }
        }
      ]
    });
    // Call API with your client and get a response for your call
    let createOrder = async function () {
      let response = await client.execute(request);
      // If call returns body in response, you can get the deserialized version from the result attribute of the response.
      let approval_url = await response.result.links.filter(
        ({ rel }) => rel === "approve"
      )[0];
      // res.redirect(approval_url.href);
      res.send(approval_url.href)
    }
    createOrder();
  } catch (error) {
    next(error)

  }

}

exports.success = async (req, res, next) => {
  const token = req.query.token;
  let userId = req.params.id
  let receiverid = req.params.receiverid
  let currency = req.params.currency
  let value = req.params.value
  let foundUser = await db.User.findById(userId)
  let foundrecipient = await db.User.findById(receiverid)
  let calculatedValue = (value * 0.9)
  if (req.app.locals.userId != userId || req.app.locals.receiverid != receiverid)
    return next({ message: "users does not match" })
  if (req.app.locals.value != value)
    return next({ message: "value tempred" })
  let payment = await new db.Payments({ currency, value, calculatedValue })
  let captureOrder = async function (orderId) {
    try {
      if (receiverid != foundrecipient.id)
        return next({ message: "user incorect" })
      request = new paypal3.orders.OrdersCaptureRequest(orderId);
      request.requestBody({

      });
      // Call API with your client and get a response for your call
      let response = await client.execute(request);
      // If call returns body in response, you can get the deserialized version from the result attribute of the response.
    } catch (error) {
      next(error)
    }
  }
  let createPayouts = async function () {
    let requestBody = {
      "sender_batch_header": {
        "recipient_type": "EMAIL",
        "email_message": "SDK payouts test txn",
        "note": "Enjoy your Payout!!",
        "sender_batch_id": payment.id,
        "email_subject": "This is a test transaction from SDK"
      },
      "items": [
        {
          "note": "Your 5$ Payout!",
          "amount": {
            "currency": currency,
            "value": calculatedValue
          },
          "receiver": foundrecipient.email,
          "sender_item_id": "Test_txn_11234"
        }
      ]
    }

    let request = new paypal2.payouts.PayoutsPostRequest();
    request.requestBody(requestBody);

    try {
      let response = await client.execute(request);
      // If call returns body in response, you can get the deserialized version from the result attribute of the response.
    } catch (error) {
      let message = await error.message
      let parsed = JSON.parse(message)
      next({ message: parsed.details[0].issue })
    }

  }
  await captureOrder(token);
  await createPayouts();
  payment.payinguser.push(foundUser.id)
  payment.recipiantuser.push(foundrecipient.id)
  payment.save()
  foundUser.paymentsimade.push(payment.id)
  foundrecipient.paymentsirecived.push(payment.id)
  foundUser.save()
  foundrecipient.save()
  let endUrl=req.app.locals.url
  res.redirect(`${process.env.FRONT_BASE_URL}${endUrl}`)
}



