const webpush = require('web-push')
const db = require('../models')

exports.webpushconfig = () => {
    console.log("webpush config done")
    let PublicKey = process.env.WEB_PUSH_PUBLIC_KEY
    let PrivateKey = process.env.WEB_PUSH_PRIVATE_KEY
    webpush.setVapidDetails('mailto:asafstr2@gmail.com', PublicKey, PrivateKey)
}


/**
 * @param {string} uid - user id as string.
 * @param {Object} notification -notification title and body keys at least,
 * full description of options = {
 *      title:string
        body: the notification body,{string}
        icon: the notification icon preferd size 96x96 must be url,{string}
        image: the notification image must be url ,{string}
        dir: 'ltr',{string}
        lang: 'en-US', // BCP 47 format,{string}
        vibrate: [100, 50, 200],//on off / on{arrey}
        badge: the notification badge preferd size 96x96 must be url,{string}
        tag: will determine if the notification will stack (can be any name ),{string}
        renotify: if the user will get notify for any notification containainig the same badge  ,{boolean} 
        actions: [
            { action: 'confirm', title: 'Okay', icon: the notification icon preferd size 96x96 must be url,{string} },
            { action: 'cancel', title: 'Cancel', icon: the notification icon preferd size 96x96 must be url,{string} }
        ]
    };
 */

exports.sendNotificationToUser = async (uid, notification) => {
    try {

        if (typeof notification !== "object" && typeof uid !== "string" && notification.title !== null && notification.body !== null) {
            console.error('err:1st arg must be a user id string 2nd arg need to be an object containe at least a title and body keys  ')
            return
        }
        let user = await db.User.findById(uid)
        let valid = []
        await user.pushNotificationEndPoints.forEach(async (pushNotificationEndPoint, i) => {

            try {
                webpush.sendNotification(pushNotificationEndPoint, JSON.stringify(notification)).catch(err => {
                    valid.push(i)
                }).then((res) => {
                    if (!res || !res.statusCode || res.statusCode != 201)
                        valid.push(i)
                })

            } catch (error) {
                valid.push(i)
            }
        })
    } catch (error) {
        console.log(error)
    }

}

/**
 * @param {string} uid - user id as string.
 * @param {Object} newSub -notification subscription object coming from front end device 
 *  
 * */
exports.registerUserToNotifications = async (uid, newSub) => {

    try {

        if (uid && newSub && typeof (uid) !== "string" && typeof (newSub) !== 'object' && newSub.endpoint) {
            console.error('err:first argument must be a user id string 2nd argumant must be the auth object from front')
            return
        }
        let registration = 'user already registered'
        let user = await db.User.findById(uid)
        if (newSub && Object.keys(newSub).length > 0) {
            // let exsitingSubscription = user.pushNotificationEndPoints.filter(authObj => authObj.endPoint === newsub.endPoint).length > 0
            // if (exsitingSubscription) {
            //     return registration
            // }
            registration = 'thank you for registering'
            user.pushNotificationEndPoints.push(newSub)
            await user.save()
            await webpush.sendNotification(newSub, JSON.stringify({ title: registration, body: '', tag: 'registration' }))
        }

        return registration
    } catch (error) {
        console.log(error)
    }

}