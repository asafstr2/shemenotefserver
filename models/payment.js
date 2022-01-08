const moongoose = require('mongoose')
const User = require('./user')

//creating the user messages schema
const paymentSchema = new moongoose.Schema(
    {
        //user is link to schema so we can access user data from messeges
        payinguser:[ {
            type: moongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        recipiantuser:[ {
            type: moongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        value: {
            type: Number
        },
        currency: {
            type: String
        },
        calculatedValue: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)

//define remove method to remove a messege from user schema messeges arrey
paymentSchema.pre('remove', async function (next) {
    try {
        //finding a user by id
        let user = await User.findById(this.user)
        //splicing the user messeges arrey on that user id
        user.payments.remove(this.id)
        //saving new arrey with messege removed
        await user.save()
        //continue
        return next()
    } catch (err) {
        //on err go to error handler
        return next(err)
    }
})

const Payment = moongoose.model('Payments', paymentSchema)
module.exports = Payment
