const mysqlSrv = require('../../services/mysqlDB');
const cache_systemClock = require('../../middlewares/cache/system-clock-sync.js');

exports.ServerResources = function(req,res,next){
    let resourcesByServer = {};
    new mysqlSrv().GetServersResourcesData(req.user.id, function(err,data){
        if(err) return res.status(500).send("Error: "+err);
        
        // aggregate by servers
        for (const mark of data.resources) {
            if(!resourcesByServer[mark.server_id]) resourcesByServer[mark.server_id] = {
                name: data.servers[mark.server_id],
                clock_sync: cache_systemClock.getServerClockSync(mark.server_id),
                data: [],
            };
            resourcesByServer[mark.server_id].data.push(mark);
        }

        const resourcesByServerArray = Object.entries(resourcesByServer);
        //console.log("Server Resources page:", resourcesByServerArray);
        res.locals.resourcesByServer = resourcesByServerArray;

        res.locals.resourcesByServerJSON = JSON.stringify(resourcesByServer);
        res.locals.hbs = "serverResources";
        next();
    });
};