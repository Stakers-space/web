const dataFile = require('../src/config/data_files.json');
const { SUPPORTED_STATES, SUPPORTED_CHAINS } = require('../src/config/definition.js');
const { getJson } = require('../src/libs/http-request.js');
const { SaveJson } = require('../src/libs/filesystem-api.js');

class UpdateCacheFiles{
    constructor(){
        this.cacheDefinitions = [
            { // validatorsSnapshot
                api: "https://stakers.space/api/state-balances",
                dir: `web/${dataFile.validatorsSnapshot}`
            },
            { // walletsSnapshot
                api: "https://stakers.space/api/wallets-balances",
                dir: `web/${dataFile.validatorWalletSnapshot}`
            }
        ];
    }

    async Process(){
        for(const cache of this.cacheDefinitions){
            for(const state of SUPPORTED_STATES){
                for(const chain of SUPPORTED_CHAINS){
                    try {
                        // get file
                        const validatorSnapshot = await getJson(`${cache.api}?f=${chain}_${state}.json`);
                        // save on disc
                        console.log("Updating", `${cache.dir}/${chain}_${state}.json`);
                        await SaveJson({
                            outPath: cache.dir,
                            filename: `${chain}_${state}.json`,
                            json: validatorSnapshot,
                            atomic: true,
                            space: 0
                        });
                    } catch(e){
                        console.error(e);
                    }
                }
            }
        }

        // Update clients file
        try {
            // get file
            const clientsDataFile = await getJson(`https://stakers.space/api/clients-datafile`);
            // save on disc
            console.log("Updating clients-datafile");
            await SaveJson({
                outPath: 'data',
                filename: `clients.json`,
                json: clientsDataFile,
                atomic: true,
                space: 0
            });
        } catch(e){
            console.error(e);
        }
    }
}

new UpdateCacheFiles().Process();