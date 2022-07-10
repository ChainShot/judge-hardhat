const path = require('path');
require('dotenv').config(path.join(__dirname, ".."));
const fs = require('fs-extra');
const childProcess = require('child_process');
const download = require('./download');
const writeCache = require('./writeCache');

const ARGS = ['setup', 'compile', 'run'];
const TOP_LEVEL_FOLDER = path.join(__dirname, "..");
const CONTENT_FOLDER = path.join(TOP_LEVEL_FOLDER, "content");
const CWD = process.cwd();
const VERSIONS = [
    "v0.6.12+commit.27d51765",
    "v0.7.5+commit.eb77ed08",
    "v0.8.4+commit.c7e474f2"
];

module.exports = async () => {
    const args = process.argv.slice(2);
    const command = args[0];
    const flags = args.slice(1).reduce((p, c) => {
        const [key, value] = c.split("=");
        p[key.slice(2)] = value;
        return p;
    }, {});
    if (ARGS.indexOf(command) < 0) {
        const usage = (await fs.readFile(path.join(__dirname, 'usage.txt'))).toString();
        console.log(usage);
        return;
    }
    if (command === 'setup') {
        // operate on the content folder as the CWD
        process.chdir(CONTENT_FOLDER);

        // download compilers
        await Promise.all(VERSIONS.map((v) => download(v)));

        // preload cache
        await writeCache();

        // install depedencies 
        childProcess.execSync("npm i", { stdio: [0, 1, 2] });
        const { run } = require('hardhat');
        await run("compile");
    }
    else if (command === 'run') {
        await copyContents(flags["copy-config"] !== 'false');
        const { run } = require('hardhat');
        await run("test");
    }
}

async function copyContents(copyConfig = true) {
    if (copyConfig) {
        await fs.copy(
            path.join(CONTENT_FOLDER, "hardhat.config.js"),
            path.join(CWD, "hardhat.config.js")
        );
    }
    await fs.copy(
        path.join(CONTENT_FOLDER, "solcBuilds.js"),
        path.join(CWD, "solcBuilds.js")
    );
    await fs.ensureSymlink(
        path.join(CONTENT_FOLDER, "node_modules"),
        path.join(CWD, "node_modules")
    );
    const cacheDir = path.join(TOP_LEVEL_FOLDER, "cache");
    const networkDir = path.join(cacheDir, "hardhat-network-fork", "network-1");
    const requests = await fs.readdir(networkDir);
    for(let i = 0; i < requests.length; i++) {
        await fs.ensureSymlink(
            path.join(networkDir, requests[i]),
            path.join(CWD, "hardhat-network-fork", "network-1", requests[i])
        );
    }
    await fs.ensureSymlink(
        path.join(cacheDir, "compilers"),
        path.join(CWD, "cache", "compilers")
    );
}