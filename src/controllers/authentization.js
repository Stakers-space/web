/**
 * Read me:
 * Account registration
 * 		1) Fill comunication email (TB accounts)
 * 		2) Send lost password form
*/

"use strict";
const config = require('../config/config.secret.json');

const bcrypt = require('bcryptjs');

var app = null;
var passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto =  require('crypto');
const mysqlLib = require('../services/mysqlDB');
const mysqlSrv = new mysqlLib();

const MailMessage = require('../models/emailMessage/account');
const MailService = require('../services/customMailing');

/**
 * Automatically checks whether the user is authentized or not
 */
passport.use(new LocalStrategy(function verify(username, password, cb) {
	//console.log("Local strategy", username, password);
	mysqlSrv.GetAccountData(username, function(err,row){
		if (err) { return cb(err); }
		if (!row) { return cb(null, false, { message: 'Incorrect user email or password.' }); }
		if(row.length === 0) return cb(null, false, { message: 'User email does not exist.' });

		let userData = row[0];
		
		bcrypt.compare(password, userData.psw_hash, (err, isMatch) => {
			if (err) {
				console.log("bcrypt compare error", err);
				return cb(err);
			}
			if (isMatch) {
				//console.log("Matched | Authentizated user:", userData);
				userData.username = userData.email;
				cb(null, userData);
				//return cb(null, user);
			} else {
				return cb(null, false, { message: 'Incorrect username or password.' });
			}
		});
	});
}));
passport.serializeUser(function(user, done) { //console.log("serialize user", user);
	process.nextTick(function() {
		//console.log("serialize:", user);
		done(null, { id: user.id, role:user.role });
	});
});
passport.deserializeUser(function(user, done) { //console.log("deserialize user", user);
	//console.log("deserializeUser (processing cookie authentization)", user);
	/*mysqlSrv.GetUserById(id, (err, user) => {
        if (err) return done(err);
        done(null, user);
    });*/
	process.nextTick(function() {
		done(null, user);
	});
});


function AuthentizationController(){
    app = this;
}

AuthentizationController.prototype.HashPassword = function(plainPassword, cb){
	bcrypt.hash(plainPassword, 16, (err, hash) => {
		return cb(err, hash);
	});
};

AuthentizationController.prototype.LoginPage = function(req,res,next){
	console.log("Login page | Authentized:", req.isAuthenticated(), req.query);
	if(req.isAuthenticated()){
		if(req.query.r) return res.redirect(req.query.r);
		res.redirect("/dashboard");
	} else {
		var url = req.originalUrl;

		if(url.indexOf("fail=true") > -1) res.failureCallback = 'Incorrect email or password. Try it again, please, alternatively you can <a href="/authentization/reset-password">reset your password</a>.';
		//res.setHeader("Access-Control-Allow-Origin", "stakers.space");
		Object.assign(res.locals, {
			template: "authentization/signin",
			actionUrl: "/authentization/login?r="+req.query.r,
			loginPage: true,
			formTitle: "Sign In",
			titletxt:{
				login: "Sign in",
				psw: "Reset password",
				acc: "Create account"
			},
			btntxt: {
				login: "Sign in",
				psw: "Submit"
			},
			linktxt:{
				login: "Sign in",
				psw: "Forgotten password",
				link: "/authentization/reset-password"
			}
		});
		res.locals.titletxt.default = res.locals.titletxt.login;
		res.locals.btntxt.default = res.locals.btntxt.login;
		res.locals.linktxt.default = res.locals.linktxt.psw;

		
		next();
	}
};

AuthentizationController.prototype.ResetPasswordPage = function(req,res,next){
	// generate unique hash
	// write hash into DB for the email
	// send email

	var url = req.originalUrl;

	if(url.indexOf("fail=true") > -1) res.failureCallback = 'Account with requested email does not exist. Check filled email and try it again, please.';
	if(url.indexOf("success=true") > -1) res.successCallback = true;

	Object.assign(res.locals, {
		template: "authentization/signin",
		actionUrl: "/authentization/reset-password",
		alternateUrl: "/authentization/reset-password",
		passwordPage: true,
		formTitle: "Reset password",
		titletxt:{
			login: "Reset password",
			psw: "Reset password",
			acc: "Create account"
		},
		btntxt: {
			login: "Sign in",
			psw: "Submit"
		},
		linktxt:{
			login: "Sign in",
			psw: "Forgotten password",
			link: "/authentization"
		}
	});
	res.locals.titletxt.default = res.locals.titletxt.psw;
	res.locals.btntxt.default = res.locals.btntxt.psw;
	res.locals.linktxt.default = res.locals.linktxt.login;

	next();
};

/**
 * Creates unique hash for user. This hash is used as a signature for setting new password
 * @param {*} email 
 * @returns hash
 */
AuthentizationController.prototype.CreateHash = function(email){
	var data = email + config.authentization.hashSeed;
	var k1 = "0" + ((Math.floor(Math.random() * 10) + 9) * 101).toString() + "62t" + email.toString(),
		h1 = new crypto.createHmac('sha512', k1).update(data).digest('hex'),
		k2 = h1.substr(7,9)+h1.substr(21,11) + "u" + h1.substr(13,21) + h1.substr(Math.floor(Math.random() * 10),12),
		h2 = new crypto.createHmac('sha512', k2).update(data).digest('hex');
	return h2.substr(71, 6) + h2.substr(15, 20) + h2.substr(40, 6) + h2.substr(51, 32);
};

AuthentizationController.prototype.IsValidEmail = function(email){
	return String(email)
		  .toLowerCase()
		  .match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	);
};

/**
 * Forgotten password page
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
AuthentizationController.prototype.ResetPassword = function(req,res){
    const email = req.body.username;
    console.log("Reset password for account:", email);
    if(!app.IsValidEmail(email)) return res.redirect("/authentization/reset-password?fail=true");
    
    var token = app.CreateHash(email);
    mysqlSrv.UpdatePasswordResetToken(email, token, function(err,rows){
        if(err) return res.redirect("/authentization/reset-password?fail=true");
        
        if(rows.affectedRows === 0){ // no account
            return res.redirect("/authentization/reset-password?fail=true");
        } else {
            var emailCnt = MailMessage.Resetpassword(email, token);
			console.log(email, emailCnt);
			MailService.SendMail("notification@stakers.space", email, emailCnt.subject, emailCnt.message, function(err,resp){
				console.log(err,resp);
			})

			return res.redirect("/authentization/reset-password?success=true");
        }
	});
};

/**
 * Add new Account to TB and Sent email for setting password
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
AuthentizationController.prototype.NewAccount = function(req,res){
    const email = req.body.username;
    if(!app.IsValidEmail(email)) return res.redirect("/authentization/new-account?fail=emailvalidation");
    // add email to DB
    var token = app.CreateHash(email);
    mysqlSrv.AddUserAccount(email, token, function(err,rows){
        console.log("Authentization | Adding User Account to DB | err:", err,"email:", email,"token:", token,"rows:", rows);
        if(err) return res.redirect("/authentization/reset-password?fail=true");
        
        if(rows.affectedRows === 0){ // no account
            return res.redirect("/authentization/new-account?fail=existingemail");
        } else {
            var emailCnt = MailMessage.AccountRegistration(email, token);
			//console.log(email, emailCnt);
			
			// Temporary - no email verification required till there will be custom mail
			//return res.redirect(emailCnt.link);

			MailService.SendMail("notification@stakers.space", email, emailCnt.subject, emailCnt.message, function(err,resp){
				console.log("Send email notif:", err,resp);
				if(err) return res.redirect("/authentization/new-account?success=false");
				return res.redirect("/authentization/new-account?success=true&email="+email);
			});

        }
	});
};


/* From Email */
AuthentizationController.prototype.SetPasswordPage = function(req,res,next){
	console.log("Authentization | Render set password page based on email link: ", req.body, req.query);
	res.locals.email = req.query.e;
	res.locals.token = req.query.vh;

	const pageUrl = req.originalUrl;
	if(pageUrl.indexOf("success=true") > -1){
		res.successCallback = "New password was succesfully set.";
	} else if(pageUrl.indexOf("fail=token") > -1) {
		res.failureCallback = 'Security token does not match. Operation rejected';
	} else if(pageUrl.indexOf("fail=emailvalidation") > -1) {
		res.failureCallback = "Filled email is not valid.";
	} else if(!app.IsValidEmail(res.locals.email)){
		res.failureCallback = "Filled email is not valid.";
	}
	
	Object.assign(res.locals, {
		template: "authentization/setpassword",
		actionUrl: "/authentization/set-password",
		titletxt: {},
		btntxt: {},
		notValidMsg: "Entered passwords do not match",
		tooShort: "Entered passwords has less than 8 characters",
	});
	res.locals.titletxt.default = "Set a password";
	res.locals.btntxt.default = "Submit";
	next();
};

AuthentizationController.prototype.SignUpEmailPage = function(req,res,next){
	const pageUrl = req.originalUrl;
	if(pageUrl.indexOf("success=true") > -1){
		res.successCallback = "Email with instructions was successfully set to your mailbox "+req.query.email;
	} else if(pageUrl.indexOf("fail=token") > -1) {
		res.failureCallback = 'Security token does not match. Operation rejected';
	} else if(pageUrl.indexOf("fail=emailvalidation") > -1) {
		res.failureCallback = "Filled email is not valid.";
	} else if(pageUrl.indexOf("fail=existingemail") > -1){
		res.failureCallback = 'Account with specified email already exists. Please, use <a href="/authentization/reset-password">Forgottent password option</a> instead.';
	} else if(pageUrl.indexOf("fail=true") > -1) {
		res.failureCallback = 'Ops, something went wrong';
	}
	
	Object.assign(res.locals, {
		template: "authentization/signup",
		actionUrl: "/authentization/new-account",
		accountPage: true,
		titletxt:{
			login: "Sign Up",
			psw: "Reset password",
			acc: "Create account"
		},
		btntxt: {
			login: "Submit",
			psw: "Sign in"
		},
		linktxt:{
			login: "Sign in",
			psw: "Forgotten password",
			link: "/authentization"
		}
	});
	res.locals.titletxt.default = res.locals.titletxt.acc;
	res.locals.btntxt.default = res.locals.btntxt.login;
	res.locals.linktxt.default = res.locals.linktxt.login;
	next();
};

AuthentizationController.prototype.SetPassword = function(req,res,next){
	if (req.originalUrl.indexOf("?") === -1) req.originalUrl+= "?";

	var email = req.body.username;
	console.log("Set password:",req.body);
	if(!app.IsValidEmail(email)) return res.redirect(req.originalUrl+"&fail=email");
	
	// verify hash for the email
	mysqlSrv.GetAccountData(email, function(err, rows){
		if(err){
			console.error(err);
			return res.redirect(req.originalUrl+"&fail=dberror");
		} else if(rows.length === 1){ // Email exists in the database
			rows = rows[0];
			console.log("Authentization | Set Password | DB marks:", rows);
			// compare tokens
			if(rows.psw_token !== null && rows.psw_token === req.body.token){ // security token matches
				// check time?
				var reqTime = rows.psw_token_time;
				var now = new Date().getTime();
				console.log("time diff", ((now - reqTime) / 1000 / 60), "minutes");

				// set new password
				//res.setHeader("Access-Control-Allow-Origin", "stakers.space");
				app.HashPassword(req.body.password, function(err,passwordHash){
					if(err) {
						console.error(err);
					}
					mysqlSrv.UpdateUserPassword(email, passwordHash, function(err,data){
						console.log("DB.UpdateUserPassword |", err,data);
						if(err) {
							console.error(err);
							return next(err);
						}

						// remove hash
						mysqlSrv.UpdatePasswordResetToken(email, null, function(err,rows){
							console.log(err, rows);
							if(err){
								console.error(err);
								return next(err);
							}
							console.log("req.login", req.body);
							req.login({id: data.insertId, email:req.body.username, username: req.body.username}, function(err) {
								if (err) { return next(err); }
								res.redirect('/dashboard');
							});
						});
					});
				});
			} else {
				// token is not same / not found
				return res.redirect(req.originalUrl+"&fail=token");
			}
		} else {
			// no mark found - not existing account
			return res.redirect(req.originalUrl+"&fail=account");
		}
	});
};

// Post request - sign in user
AuthentizationController.prototype.LogUser = function (req, res, next) {
	//passport.authenticate('local', {
	//	successRedirect: '/dashboard',
	//	failureRedirect: '/authentization?fail=true',
	//	failureMessage: true
	//}/*, function(err, user, info, status){
	//	console.log(err,user);
	//}*/);
	passport.authenticate('local', function (err, user, info) {
		if (err) { return next(err); }
		if (!user) { return res.redirect('/authentization?fail=true'); }
		
		req.logIn(user, function (err) {
		  if (err) { return next(err); }
		  
		  const redirectUrl = req.query.r || '/dashboard'; // použij redirect nebo dashboard jako výchozí
		  return res.redirect(redirectUrl);
		});
	  })(req, res, next);
};

AuthentizationController.prototype.LogOut = function(req,res){
	//if(req.isAuthenticated()){
		req.logout(function(err) {
			if (err) { return next(err); }
			res.redirect('/authentization');
		});
	//} else {
	//	res.redirect('/login');
	//}
};

AuthentizationController.prototype.Render = function(req,res){
	res.locals.loginUrl = "/authentization/login";
	res.locals.newPswUrl = "/authentization/reset-password";
	res.locals.newAccUrl = "/authentization/new-account";
	res.locals.lang = "en";

	//console.log("session:", req.session);

	res.cookie('lang', res.locals.lang, { maxAge: 31536000000, httpOnly: false });

	res.render(res.locals.template, {
		layout: "standard",
		cssFile: "authentization",
		pageUrl: 'https://stakers.space'+req.originalUrl,//('https://' + req.appData.host + req.canonicalUrl),
		title: "Stakers.space Dashboard",//req.appData.meta.title,
		metaDescription: "Sign in To Stakers.space account to manage all your servers and validators owned by you or your clients safely from one place. Client-side encrypted dashboard.",
		lang: null,//req.appData.meta.lang,
		js:null,//req.appData.meta.js,
		css:null,//req.appData.meta.css,
		logo: null,//req.appData.meta.logo,
		isError: false,
		successCallback: res.successCallback,
		failureCallback: res.failureCallback,
		locals: res.locals,
		helpers: app.HandlebarsHelpers()
	});
};

AuthentizationController.prototype.HandlebarsHelpers = function(){
	return {
		and() {
			return Array.prototype.every.call(arguments, Boolean);
		},
		or() {
			return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
		}
	};
};

AuthentizationController.prototype.SignInDemoAccount = function(req,res){
	req.login({id: 4, email:'demo@stakers.space', username: 'demo@stakers.space'}, function(err) {
		if (err) { return next(err); }
		res.redirect('/dashboard');
	});
};

module.exports = AuthentizationController;