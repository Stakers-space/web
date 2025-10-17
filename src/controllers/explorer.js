const fs = require('node:fs/promises');
const path = require('path');
const dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
const { ReadStateFiles } = require('../utils/filesystem-utils.js');

exports.Wallet = async (req, res, next) => {
    res.locals.page_hbs = 'shared_ethgno/wallet';
    res.locals.layout_hbs = "standard";
    res.locals.css_file = 'explorer';
    res.locals.title = `Wallets explorer`;
    res.locals.metaDescription = `Staking wallet explorer for ${res.locals.chain} chain.`;

    const data = await ReadStateFiles(dataFile.validatorWalletSnapshot, res.locals.chain);
    console.log(data);
    
    const rest = req.params.path || null; // null for /wallet
    if(!rest){

    }

    next();
}

exports.Validator = async (req, res, next) => {
    res.locals.page_hbs = 'shared_ethgno/validator';
    res.locals.layout_hbs = "standard";
    res.locals.css_file = 'explorer';
    res.locals.title = `Validators explorer`;;
    res.locals.metaDescription = `Staking wallet explorer for ${res.locals.chain} chain.`;
    const data = await ReadStateFiles(dataFile.validatorsSnapshot, res.locals.chain);
    console.log(data);

    const rest = req.params.path || ''; // null for /validator   
    if(!rest){

    }

    next();
}