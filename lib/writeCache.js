const JSZip = require('jszip');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const CACHE_URL = process.env.CACHE_URL; 
const CACHE_DIR = path.join(__dirname, "..", "cache");

async function writeCache() {
    if(!CACHE_URL) {
        return;
    }

    const { data } = await axios.get(CACHE_URL);

    const zip = await JSZip.loadAsync(data, { base64: true });

    const keys = Object.keys(zip.files);
    for(let i = 0; i < keys.length; i++) {
        const fileName = keys[i];
        if(!zip.files[fileName].dir) {
            const fileData = await zip.files[fileName].async('string');
            const outputFilePath = path.join(CACHE_DIR, fileName);
            await fs.outputFile(outputFilePath, fileData);
            fs.chmodSync(outputFilePath, 0o755);
        }
    }
}

module.exports = writeCache;