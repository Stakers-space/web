const fs = require('node:fs/promises');
const path = require('path');
const dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
const { SUPPORTED_STATES, SUPPORTED_CHAINS } = require('../config/definition.js');

exports.ReturnWalletSnapshotMinified = async(req, res) => {
    const chain = String(req.query.chain || '').toLowerCase();
    const state = String(req.query.state || '').toLowerCase();
    let wallets = String(req.query.wallets || '').toLowerCase();

    if (!chain || !SUPPORTED_CHAINS.includes(chain)) {
        return res.status(400).json({ error: 'Chain is not within supported list', supported: SUPPORTED_CHAINS });
    }
    if (!state || !SUPPORTED_STATES.includes(state)) {
        return res.status(400).json({ error: 'State is not within supported list', supported: SUPPORTED_STATES });
    }

    try {
        const filePath = path.join(__dirname, '..', '..', dataFile.validatorWalletSnapshot, `${chain}_${state}.json`);
        const fileContent = await fs.readFile(filePath, { encoding: 'utf8' });
        let parsed;
        try {
            parsed = JSON.parse(fileContent);
        } catch (e) {
            return res.status(500).json({ error: 'Corrupted JSON file' });
        }

        if (parsed?.data && typeof parsed.data === 'object') {
            if(wallets) {
                let filtered = {
                    epoch: parsed?.epoch,
                    data: {}
                };
                wallets = wallets.split(",");
                for(const wallet of wallets){
                    if(parsed.data[wallet]){
                        filtered.data[wallet] = parsed.data[wallet];
                        filtered.data[wallet].validators = filtered.data[wallet]?.validators?.length;
                    }
                }
                return res.json(filtered);
            } else {
                for (const [wallet, wdata] of Object.entries(parsed.data)) {
                    if (wdata && Array.isArray(wdata.validators)) {
                        wdata.validators = wdata.validators.length;
                    }
                }
                return res.json(parsed);
            }
        }
        return res.json(parsed);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.status(404).json({ error: 'Snapshot not found' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
}