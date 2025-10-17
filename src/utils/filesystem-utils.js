const { SUPPORTED_STATES } = require('../config/definition.js');
const fs = require('fs/promises');
const path = require('path');

async function ReadStateFiles(dataDir, chain){
    const baseDir = path.join(__dirname, '..', '..', dataDir);

    const files = SUPPORTED_STATES.map((state) => ({
        key: state,
        file: path.join(baseDir, `${chain}_${state}.json`),
    }));

    // parallel reading
    const tasks = files.map(async ({ key, file }) => {
        try {
            const txt = await fs.readFile(file, 'utf8');
            const json = JSON.parse(txt);
            return { key, json };
        } catch (e) {
            console.error(e);
            return { key, json: null, error: e };
        }
    });
    return await Promise.allSettled(tasks);
}

module.exports = {
    ReadStateFiles
}