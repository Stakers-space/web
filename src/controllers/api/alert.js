const cache = require('../../middlewares/cache');

exports.ReturnAlertState = (req, res, next) => {
    // verify api key, get account instances
    // return: 0 = no notification 
            // 1 = common notification
            // 2 = critical notification 

    // add account id and api token
    
    let responseState = 0;
    if(!cache.getSetValidatorsStateSynced()) {
        responseState = 2;
    } else {
        responseState = cache.getOfflineStatesAlertType();
    }

    res.send(JSON.stringify({"alert":responseState}));
};