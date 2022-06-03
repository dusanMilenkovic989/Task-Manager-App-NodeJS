'use strict'

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const welcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'dusan.milenkovic989@gmail.com',
        subject: 'Welcome to Task manager App!',
        text: `Howdy ${name}! Let us know how you get along with our application, what you expect of it, or how we could improve it to fit your needs. Best of luck with managing your life through our task manager application!`
    })
}

const goodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'dusan.milenkovic989@gmail.com',
        subject: 'Goodbye and join us again if you change your mind!',
        text: 
`Dear ${name},

We are sorry to see you leaving us. 

If it does not bother you, please let us know if there was something we could have done to have kept you onboard.

If you did not like anything specific, please do tell, and feel free to leave any suggestions for our future app improvement.

Best of luck in your future life adventures!

Yours sincerely,
Task manager App team!`
    })
}

module.exports = {
    welcomeEmail,
    goodbyeEmail
}