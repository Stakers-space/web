"use strict";

const router = require('express').Router();
const mysqlSrv = require('../services/mysqlDB');
const MailService = require('../services/customMailing');
const MailMessage = require('../models/emailMessage/validators_alert.js');

let alertApp = null;

class AlertApp {
    constructor(){
        alertApp = this;
        
        router.get('/login', this.LoginAlert);
    }

    LoginAlert(req, res){
        console.log("Alert | Login", req.query);
        if(Object.keys(req.query).length === 0) return res.status(500).send("No params specified");
        new mysqlSrv().GetAccountContact(Number(req.query.a), function(err, account){
            if(err){
                console.error(err);
                return res.status(500).send("Something went wrong");
            }
            if(account.length > 0) account = account[0];
            if(account.api_token !== req.query.t) return res.status(500).send("Unauthorized access");
            console.log("├── Process", req.query, account.email_subsriptions);
            new mysqlSrv().UpdateLoginMark(req.query.s, req.query.a, req.query.l, function(err, resp){
                if(err) console.error("mysqlSql().UpdateLoginMark", err);
            });

            if(account.email_subsriptions === "alerts"){
                const msg = MailMessage.ServerAuthentization(account);
                MailService.SendMail(null, account.email_alerts, msg.subject, msg.message);
                console.log("└── email sent");
            }
            res.send("ok");
        });
    }
}

new AlertApp();
module.exports = router;