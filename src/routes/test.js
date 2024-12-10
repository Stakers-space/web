"use strict";
const router = require('express').Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json( /*{limit: '1mb'}*/ ));


router.get('/', function(req,res){
    console.log("test get");
	res.send("Test");
});
router.post('/', function(req,res){
    console.log("test post", req.body);
	res.send("Test");
});

module.exports = router;