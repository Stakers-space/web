const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream');
const dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));

exports.FileValidation = (req, res, next) => {
    // file name validation
    const rawFileName = (req.headers['x-filename'] || '').toString().trim();
    if (!rawFileName) return res.status(400).send('Missing X-Filename header');
    
    let base = path.basename(rawFileName);
    if (!base.toLowerCase().endsWith('.json'))  return res.status(415).send('Only .json files are allowed');
    if (!/^[a-zA-Z0-9._-]+\.json$/.test(base)) return res.status(400).send('Invalid filename');
        
    // content-type header validation
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (!ct.includes('application/json') && !ct.includes('application/octet-stream')) {
        return res.status(415).send('Expected Content-Type: application/json or application/octet-stream');
    }
    next();
}

exports.PutValidatorsBalancesFile = async (req,res, next) => {
    res.locals.DATA_DIR = path.join(__dirname, '..', '..', dataFile.validatorsSnapshot);
    res.locals.TMP_DIR  = path.join('/tmp', 'validators_snapshot_uploads');
    res.locals.MAX_BYTES = 50 * 1024 * 1024; // 50 MB
    res.locals.FNAME = "UpdateValidatorsBalancesFile";
	next();
};

exports.PutWalletsBalanceFile = async (req,res, next) => {
    res.locals.DATA_DIR = path.join(__dirname, '..', '..', dataFile.validatorWalletSnapshot);
    res.locals.TMP_DIR  = path.join('/tmp', 'validators_wlt_snapshot_uploads');
    res.locals.MAX_BYTES = 30 * 1024 * 1024; // 30 MB
    res.locals.FNAME = "UpdateWalletsBalanceFile";
    next();
}

exports.UpdateFile = async(req, res) => {
    try {
        // directories preparation
        await fs.promises.mkdir(res.locals.TMP_DIR,  { recursive: true });
        await fs.promises.mkdir(res.locals.DATA_DIR, { recursive: true });

        const tmpDest  = path.join(res.locals.TMP_DIR, `${Date.now()}-${crypto.randomUUID()}.tmp`);
        const tmpWrite = fs.createWriteStream(tmpDest, { flags: 'w' });

        // stream
        const expectSha = req.headers['x-checksum-sha256'];
        const hash = crypto.createHash('sha256');
        let total = 0;

        req.on('data', (chunk) => {
            total += chunk.length;
            if (total > res.locals.MAX_BYTES) {
                console.error(`Accept ${res.locals.FNAME} file API | Payload too large`);
                req.destroy(new Error('Payload too large'));
            }
            hash.update(chunk);
        });

        pipeline(req, tmpWrite, async (err) => {
            if (err) {
                try { await fs.promises.unlink(tmpDest); } catch {}
                const msg = err.message === 'Payload too large' ? 'Payload too large' : 'Write failed';
                return res.status(msg === 'Payload too large' ? 413 : 500).send(msg);
            }

            // checksum
            const gotSha = hash.digest('hex');
            if (expectSha && expectSha !== gotSha) {
                try { await fs.promises.unlink(tmpDest); } catch {}
                console.error("Checksum mismatch |", expectSha, gotSha, total);
                return res.status(400).send('Checksum mismatch');
            }

            //let validatorsCountInSnapshot = null;
            // 6) Content validation: try JSON.parse
            try {
                const text = await fs.promises.readFile(tmpDest, 'utf8');
                /*const spanshotData = */JSON.parse(text); // if crash, not a valid json

                // get length → Write to DB
                //validatorsCountInSnapshot = Object.keys(snapshotData.data).length;
            } catch (e) {
                try { await fs.promises.unlink(tmpDest); } catch {}
                return res.status(400).send('Invalid JSON content');
            }

            // 7) move to DATA_DIR (EXDEV-safe)
            const rawFileName = (req.headers['x-filename'] || '').toString().trim();
            const base = path.basename(rawFileName);
            const finalPath = path.join(res.locals.DATA_DIR, base);
            try {
                await moveFileAtomicAcrossFS(tmpDest, finalPath);
            } catch (e) {
                try { await fs.promises.unlink(tmpDest); } catch {}
                return res.status(500).send('Finalize failed');
            }

            return res.status(201).json({ ok: true, file: finalPath, sha256: gotSha, bytes: total });
        });
    } catch (e) {
        console.error(e);
        return res.status(500).send('Server error');
    }
}

exports.ReturnStateBalanceFile = (req, res, next) => { res.locals.DATA_DIR = dataFile.validatorsSnapshot; next();}
exports.ReturnWalletsBalanceFile = (req, res, next) => { res.locals.DATA_DIR = dataFile.validatorWalletSnapshot; next();}
exports.ReturnFile = async(req,res) => {
    const DATA_DIR = path.join(__dirname, '..', '..', res.locals.DATA_DIR);
    try {
        const name = String(req.query.f);
        if (!/^[a-zA-Z0-9._-]+\.json$/.test(name)) {
            return res.status(400).send('Invalid filename');
        }
        const abs = path.join(DATA_DIR, name);
        const st = await fs.promises.stat(abs).catch(() => null);
        if (!st || !st.isFile()) return res.status(404).send('Not found');

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Length', st.size);

        fs.createReadStream(abs)
            .on('error', () => res.sendStatus(500))
            .pipe(res);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }
}

async function moveFileAtomicAcrossFS(src, dest) {
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    try {
        await fs.promises.rename(src, dest); // stejné FS → atomicky
        return;
    } catch (e) {
        if (!e || e.code !== 'EXDEV') throw e; // jiná chyba
    }

    // Fallback: copy and remove source
    await new Promise((resolve, reject) => {
        const rd = fs.createReadStream(src);
        const wr = fs.createWriteStream(dest, { flags: 'w' });
        rd.on('error', reject);
        wr.on('error', reject);
        wr.on('close', resolve);
        rd.pipe(wr);
    });

    // optional fsync of file (usually not necessary)
    try {
        const fh = await fs.promises.open(dest, 'r');
        await fh.sync();
        await fh.close();
    } catch {}

    await fs.promises.unlink(src);
}