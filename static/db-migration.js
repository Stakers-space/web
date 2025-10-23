const azureCosmosDB = require('../src/services/azureCosmosDB');

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

function createFamilyItemP(container, item) {
  return new Promise((resolve, reject) => {
    
  });
}

class MigrateDb {
    async migrateValidatorCounts(){
        try {
            const dbData = await azureCosmosDB.queryContainer("data", "SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.day", "gno-beaconchain");
            for(const o of dbData){
                const obj = {
                    id: `gno-valcount-${o.day}`,
                    partitionKey: 'gno-valcount',
                    time: Math.floor(o.timestamp / 1000),
                    stateCount: {
                        active_ongoing: {
                            "validators": o.validators,
                            "balance": null,
                            "eff_balance": o.stakedGno,
                            "wallets": null
                        }
                    }
                }
                // push to azure eth-valcount
                try {
                    await azureCosmosDB.createFamilyItem('data', obj);
                } catch (e) {
                    console.error('save state_snap to cosmosDB |', e);
                } finally {
                    await sleep(1000);
                }
           }
        } catch(e){
            console.error("Error querying data:", e);
            return;
        }
    }
}

new MigrateDb().migrateValidatorCounts();