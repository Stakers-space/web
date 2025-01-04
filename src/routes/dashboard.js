"use strict";
const router = require('express').Router();
const Controller = require('../controllers/dashboard/home');
const Controller_Server = require('../controllers/dashboard/Server');
const Controller_Instance = require('../controllers/dashboard/Instance');
const Controller_Others = require('../controllers/dashboard/Other')
const Admin = require('../controllers/admin');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportConf = require('../config/config.secret.json').passport;
router.use(session({
	secret: passportConf.sessionSecret,
	resave: false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	cookie: { secure: false,/*!appConfig.isLocalhost,*/ maxAge: (365*24*60*60000) }
}));
router.use(passport.initialize());
router.use(passport.authenticate('session'));
router.use(passport.session());

router.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));
router.use(bodyParser.json( {limit: '15mb'} ));
router.use(cookieParser());
/**
 * Routes
 */
class DashboardRouter {
    constructor(){
        router.get('/', this.DashboardBtn, Controller.Dashboard, this.Render);
        
        // Server-related
        router.get('/server-node/define', this.Auth, Controller_Server.DefineServer, this.Render);
        router.post('/define', this.Auth, Controller_Server.AddOrUpdateServer);
        router.post('/edit-server-note', this.Auth, Controller_Server.OnEditServerNote);
        
        //router.get('/decrypted-user-data', this.Auth, Controller.GetDecryptedUserData) // requested from client browser, returns encrypted data that are decrypted in the user browser
        
        // Validator instance related
        router.get('/server-node/define-instance', this.Auth, Controller_Instance.DefineInstance, this.Render);
        router.post('/define-instance', this.Auth, Controller_Instance.AddOrUpdateInstanceMetadata);
        router.post('/define-instance/link-account', this.Auth, Controller_Instance.LinkInstanceToAccount);
        router.post('/define-instance/keystores', this.Auth, Controller_Instance.OnProcessKeystores);
        router.post('/define-instance/link-instance', this.Auth, Controller_Instance.OnLinkInstance);
        
        // news-related
        router.get('/admin/news', this.Auth, Admin.NewsPage, this.Render);
        router.post('/manage-news', this.Auth, Admin.ManageNewsMessage);
        // clients-related
        router.get('/admin/clients', this.Auth, Admin.ClientsPage, this.Render);
        router.post('/update-clients', this.Auth, Admin.UpdateClientsFile);

        // server resources
        router.get('/servers-resources', this.Auth, Controller_Others.ServerResources, this.Render);

        //router.post('/custom-server-action', this.Auth, ...)

        router.get('/server-node/order', this.Auth, function(req,res,next){
            res.locals.hbs = "order-saas";
            next();
        }, this.Render);
        router.get('/api', this.Auth, Admin.ApiPage, this.Render);
    }

    DashboardBtn(req,res,next){
        if(!req.isAuthenticated()) return res.redirect("/account");
        res.locals.isDemoAccount = (Number(req.user.id) === 4);
        next();
    }

    Auth(req,res,next){
        if(!req.isAuthenticated()) return res.redirect("/authentization");
        res.locals.isDemoAccount = (Number(req.user.id) === 4);
        next();
    };

    Render(req,res){
        if(res.locals.err){
            console.log("err:", res.locals.err);
            return res.send(res.locals.err);
        }
        res.render("dashboard/"+res.locals.hbs, {
            layout: "standard",
            pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
            alternateUrl: null,//alternateUrl,
            alternateLang: null,//req.appData.meta.alt.lang,
            title: "Stakers.space",//req.appData.meta.title,
            metaDescription: null,//req.appData.meta.meta_desc,
            lang: "en",//req.appData.meta.lang,
            js:null,//req.appData.meta.js,
            cssFile: "dashboard",//req.appData.meta.css,
            helpers: {}
        });
    }
}

new DashboardRouter();
module.exports = router;