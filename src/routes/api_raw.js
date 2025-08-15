"use strict";
const express = require('express');
const router = express.Router();
const Controller = require('../controllers/filesController.js');
const config = require('../config/config.secret.json');

/* token authentization */
function tokenAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (token !== config.keystoresUpdatorToken) return res.status(401).send('Unauthorized');
  next();
}

router.put('/state_balances', tokenAuth, Controller.UpdateValidatorsBalancesFile);
router.get('/state-balances', Controller.ReturnFile);
module.exports = router;