const emailObject = ({ type, ...data }) => {
	let obj = {
		MESSAGE_REQUEST: data => ({
			title: `You got a new message request from: ${data.user.username}`,
			button: 'View request',
			imageSrc: data.user.profileImageUrl,
			hrefLink: 'chat'
		}),
		MESSAGE_ACCEPTED: data => ({
			title: `Its a match! Your request has been accepted for: ${data.post.title}`,
			button: 'Respond',
			imageSrc:
				'https://mcusercontent.com/a27c91a115d4dca1caf9ae3f2/images/58e2e00c-477f-f40b-8117-0c5efa73ed13.png',
			hrefLink: 'chat'
		}),
		GOT_GIFT: data => ({
			title: `Gifting Accomplished! We're so happy you got a gift from: ${data.user.username}`,
			button: 'Value the gift',
			body: 'And how happy are you?\nSay it by valueing the gift here below',
			imageSrc: data.user.profileImageUrl,
			hrefLink: `posts/${data.post.id}`
		}),
		NEW_INBOX_MESSAGE: data => ({
			title: `A new message from ${data.user.username} is waiting in your inbox`,
			button: 'View message',
			imageSrc: data.user.profileImageUrl,
			hrefLink: 'chat'
		}),
		PASSWORD_RESET: data =>{
			return ({
			title: `we are sorry you cannot remember your password`,
			button: 'Reset password',
			imageSrc: 'https://www.pinclipart.com/picdir/middle/175-1755232_create-icons-from-png-jpg-images-online-password.png',
			hrefLink: `resetpassword?token=${data.token}`
		})}
	}
	return obj[type](data)
}

module.exports = { emailObject }
