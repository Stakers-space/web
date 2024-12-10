var app = null;
const azureCosmosDB = require('../services/azureCosmosDB');

class AzureCosmosDBManager {
    constructor() {
        
    }

    CreateTable(){
        azureCosmosDB.createContainer("stakerspace", "data", (err, resp) => {
            console.log("createContainer",err);
            if(err) return;
            azureCosmosDB.scaleContainer("stakerspace", "data", (err, resp) => {
                console.log("scaleContainer",err);
                if(err) return;
            });
        });
    }

    CreateDB(){
        azureCosmosDB.createDatabase("stakerspace", (err,resp) => {
            console.log(err,resp);
        });
    }

    GetPartionKeysList(){
        azureCosmosDB.getPartitionKeys("data", function(err,resp){
            console.log(err,resp);
        });
    }
}
//new AzureCosmosDBManager().CreateDB();
//new AzureCosmosDBManager().CreateTable();
new AzureCosmosDBManager().GetPartionKeysList();

