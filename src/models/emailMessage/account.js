

exports.AccountRegistration = function(emailAddress, token){
    console.log("AccountRegistration | Generate email", emailAddress, token);
	var email = {
		subject: "",
		message: ""
	};
	var link = 'https://stakers.space/dashboard/authentization/set-password?e='+emailAddress+'&vh='+token;
        email.subject = "Password for Stakers.space account";
        email.message = 'Hello,\n\nthank you for joining Stakers.space dashboard. You can set password for your account associated with email '+emailAddress+' by clicking on the following unique link: "'+link+'".\n';
		email.message += 'In a case of any problem, the whole link can be copied and opened in any web browser.\n\n';
		email.message += 'If the request is not from you, either ignore it or let us know.\n\nRegards and have a nice day,\nStakers.space';
	return email;
};

exports.Resetpassword = function(emailAddress, token){
    console.log("Reset password | Generate email", emailAddress, token);
	var email = {
		subject: "",
		message: ""
	};
	var link = 'https://stakers.space/dashboard/authentization/set-password?e='+emailAddress+'&vh='+token;
		email.subject = "Reset Password";
		email.message = 'Hello,\n\nA password reset request for Stakers.space account has been sent to your '+emailAddress+' email address. You can set a new password by clicking on the following unique link: "'+link+'".\n';
		email.message += 'In a case of problems, the link with the password setting page can be copied and opened in any web browser.\n\n';
		email.message += 'If the request is not from you, please let us know.\n\nRegards and have a nice day,\nStakers.space';
	return email;
};