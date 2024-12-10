"use strict";
const router = require('express').Router();
const AuthentizationController = require('../controllers/authentization');

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json({ limit: '1mb' }));

/*router.use((req, res, next) => {
    console.log('Session:', req.session);
    console.log('User in session:', req.user);
    next();
});*/

class AuthentizationRouter {
    constructor(){
        this.authentization = new AuthentizationController();
        this.httpListener();
    }

    httpListener(){
        // Get requests
        router.get("/", this.authentization.LoginPage, this.authentization.Render); // Log In
        router.get("/new-account",this.authentization.SignUpEmailPage, this.authentization.Render); // Register
        router.get("/reset-password",this.authentization.ResetPasswordPage, this.authentization.Render);
        router.get("/set-password",this.authentization.SetPasswordPage, this.authentization.Render); // From email
        router.get("/logout", this.authentization.LogOut); // Log Out passport middleware
        router.get("/demo", this.authentization.SignInDemoAccount);

        // Post requests
        router.post("/login", this.authentization.LogUser); // Log In passport middleware
        router.post("/reset-password", this.authentization.ResetPassword); // Reset password
        router.post("/set-password",this.authentization.SetPassword); // ??
        router.post("/new-account",this.authentization.NewAccount); // Add Email to DB
    }
}

new AuthentizationRouter();
module.exports = router;