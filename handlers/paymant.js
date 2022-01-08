//to do create live keys and move them to ENV 

const stripe = require("stripe")(process.env.STRIPE);
const paypal3 = require('@paypal/checkout-server-sdk');
const paypal2 = require('@paypal/payouts-sdk');
const db = require('../models')

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT
const PAYPAL_SECRET = process.env.PAYPAL_SECRET
const BASE_URL = process.env.BASE_URL
// * This route uses SandboxEnvironment. In production, use LiveEnvironment.

const env = new paypal2.core.SandboxEnvironment(PAYPAL_CLIENT, PAYPAL_SECRET);
const client = new paypal2.core.PayPalHttpClient(env);

exports.createPaymant = async (req, res, next) => {
  try {
    const total = req.query.total;
    if (total > 0) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "usd",
      });
      res.status(201).send({
        clientSecret: paymentIntent.client_secret,
      });
    }
    else {
      return next({
        status: 400,
        message: 'total cant be 0'
      })
    }
  } catch (error) {
    next(error);

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



