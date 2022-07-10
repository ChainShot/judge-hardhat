const JSZip = require('jszip');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const chmodr = require('chmodr');

const CACHE_URL = process.env.CACHE_URL; 
const CACHE_DIR = path.join(__dirname, "..", "cache");

async function writeCache() {
    if(!CACHE_URL) {
        return;
    }

    const requestCache = path.join(CACHE_DIR, "hardhat-network-fork", "network-1");
    await fs.ensureDir(requestCache);

    const { data } = await axios.get(CACHE_URL);

    const zip = await JSZip.loadAsync(data, { base64: true });

    const keys = Object.keys(zip.files);
    for(let i = 0; i < keys.length; i++) {
        const fileName = keys[i];
        if(!zip.files[fileName].dir) {
            const fileData = await zip.files[fileName].async('string');
            const outputFilePath = path.join(CACHE_DIR, fileName);
            await fs.outputFile(outputFilePath, fileData);
            fs.chmodSync(outputFilePath, 0o777);
        }
    }

    return new Promise((resolve, reject) => {
        chmodr(CACHE_DIR, 0o777, (err) => {
            if(err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

module.exports = writeCache;