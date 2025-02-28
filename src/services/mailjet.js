/**
 * Mailjet.com Email service
 */
/*const config = require('../config/config.secret.json').mailJet;
const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect( config.apikey, config.secretkey);

const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
                "From": {
                  "Email": "stakersspace@proton.me",
                  "Name": "Peter"
                },
                "To": [
                  {
                    "Email": "itgg2@proton.me",
                    "Name": "Roland"
                  }
                ],
                "Subject": "Greetings from Mailjet.",
                "TextPart": "My first Mailjet email",
                "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
                "CustomID": "AppGettingStartedTest"
              }
          ]
        })

request
    .then((result) => {
        console.log(result.body)
    })
    .catch((err) => {
        console.log("err:",err.statusCode)
    })*/