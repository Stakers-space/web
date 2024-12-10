const mysqlSrv = require('../../services/mysqlDB');

exports.ServerResources = function(req,res,next){
    let resourcesByServer = {};
    new mysqlSrv().GetServersResourcesData(req.user.id, function(err,data){

        // aggregate by servers
        for (const mark of data) {
            if(!resourcesByServer[mark.server_id]) resourcesByServer[mark.server_id] = [];
            resourcesByServer[mark.server_id].push(mark);
        }

        const resourcesByServerArray = Object.entries(resourcesByServer);
        res.locals.resourcesByServer = resourcesByServerArray;

        res.locals.resourcesByServerJSON = JSON.stringify(resourcesByServer);
        res.locals.hbs = "serverResources";
        next();
    });
};