function Ethereum(req,res,next){
    res.locals.chain = "ethereum";
    res.locals.slashChain = "/ethereum";
    res.locals.chainToken = "eth";
    res.locals.chainTokenUpr = "ETH";
    res.locals.servicePrefix = "eth-";
    res.locals.chainName = "Ethereum"
    res.locals.chainUrl = "ethereum-staking";
    res.locals.isEthereum = true;
    res.locals.network = "mainnet";
    next();
}

function Gnosis(req,res,next){
    res.locals.chain = "gnosis";
    res.locals.slashChain = "/gnosis";
    res.locals.chainToken = "gno";
    res.locals.chainTokenUpr = "GNO";
    res.locals.servicePrefix = "gno-";
    res.locals.chainName = "Gnosis"
    res.locals.chainUrl = "gnosis-staking";
    res.locals.isGnosis = true;
    res.locals.network = "gnosis";
    next();
}

module.exports = {
    Ethereum,
    Gnosis
};