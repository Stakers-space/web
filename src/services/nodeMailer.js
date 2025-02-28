/*var nodemailer = require("nodemailer");

async function SendMail(receiver, content){
	//DOCS: https://www.npmjs.com/package/nodemailer/v/2.2.0-rc.8
	let transporter = nodemailer.createTransport({
		host: "localhost",
		port: 25//,
		  //secure: false // true for 465, false for other ports
	});

	// verify connection configuration
	transporter.verify(function(error, success) {
		if (error) {
			  console.error(error);
		} else if(success){
			 console.log("Server is ready to take our messages");
		} else {
			console.log("transporter.verify |", error, success);
		}
	});

	// send mail with defined transport object
	var mailOptions = {
		from: '"Stakers.space Registration" <stakersspace@proton.me>', // sender address
		to: receiver, // list of receivers
		subject: content.subject, // Subject line
		text: content.message//, // plain text body
		//html: "<b>Hello world?</b>" // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log("Sending Email |", new Date(), error, mailOptions);
		}
		console.log('Message sent: ' + info.response);
	});
}

module.exports = {
    SendMail
}*/