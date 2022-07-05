require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const childProcess = require('child_process');
const download = require('./download');

const ARGS = ['setup', 'compile', 'run'];
const CONTENT_FOLDER = path.join(__dirname, "..", "content");
const CWD = process.cwd();
const VERSIONS = [
    "v0.6.12+commit.27d51765",
    "v0.7.5+commit.eb77ed08",
    "v0.8.4+commit.c7e474f2"
];

module.exports = async () => {
    const arg = process.argv.slice(2)[0];
    if (ARGS.indexOf(arg) < 0) {
        const usage = (await fs.readFile(path.join(__dirname, 'usage.txt'))).toString();
        console.log(usage);
        return;
    }
    if (arg === 'setup') {
        try {
            // operate on the content folder as the CWD
            process.chdir(CONTENT_FOLDER);
            await Promise.all(VERSIONS.map((v) => download(v)));
            childProcess.execSync("npm i", { stdio: [0,1,2] });
            const { run } = require('hardhat');
            await run("compile");
        }
        catch (ex) {
            console.error(ex);
        }
    }
    else if (arg === 'compile') {
        try {
            await copyContents();
            const { run } = require('hardhat');
            await run("compile");
        }
        catch(ex) {
            console.error(ex);
        }
    }
    else if (arg === 'run') {
        const { run } = require('hardhat');
        await run("test");
    }
}

async function copyContents() {
    await fs.copy(
        path.join(CONTENT_FOLDER, "hardhat.config.js"),
        path.join(CWD, "hardhat.config.js")
    );
    await fs.ensureSymlink(
        path.join(CONTENT_FOLDER, "node_modules"),
        path.join(CWD, "node_modules")
    );
}