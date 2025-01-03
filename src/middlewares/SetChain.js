function Ethereum(req,res,next){
    res.locals.chain = "ethereum";
    res.locals.slashChain = "/ethereum";
    res.locals.chainToken = "eth";
    res.locals.servicePrefix = "eth-";
    res.locals.chainName = "Ethereum"
    res.locals.chainUrl = "ethereum-staking";
    res.locals.isEthereum = true;
    next();
}

function Gnosis(req,res,next){
    res.locals.chain = "gnosis";
    res.locals.slashChain = "/gnosis";
    res.locals.chainToken = "gno";
    res.locals.servicePrefix = "gno-";
    res.locals.chainName = "Gnosis"
    res.locals.chainUrl = "gnosis-staking";
    res.locals.isGnosis = true;
    next();
}

module.exports = {
    Ethereum,
    Gnosis
};