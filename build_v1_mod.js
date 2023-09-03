const fs = require('fs');
const path = require('path');
const JSZip = require('./jszip');

function getFilesFromDirectory(directory) {
    let result = [];
    for (let entry of fs.readdirSync(directory, { withFileTypes: true })) {
        let fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            result.push(...getFilesFromDirectory(fullPath));
        } else {
            result.push(fullPath);
        }
    }
    return result;
}

function shouldZip(path) {
    if (path.endsWith('LICENSE-FOR-ART-ASSETS')) return false;
    return true;
}

function addToZip(zip, pathOnDisk, pathInZip) {
    let file = fs.readFileSync(pathOnDisk);
    zip.file(pathInZip, file);
}

console.log('Zipping...');

let zip = new JSZip();

let assetsDir = path.join(__dirname, 'bin/assets');
let files = getFilesFromDirectory(assetsDir)
            .filter(shouldZip);

for (let file of files) {
    addToZip(zip, file, path.relative(assetsDir, file));
}

let gamejsFile = path.join(__dirname, 'bin/js/game.js');
if (!fs.existsSync(gamejsFile)) {
    throw new Error('Cannot find bin/js/game.js. Have you compiled the game with `tsc`?');
}
addToZip(zip, gamejsFile, 'game.js');

zip.generateAsync({ type: "nodebuffer" }).then(function (buffer) {
    let targetDir = path.join(__dirname, 'build');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'autoballs-mod.zip'), buffer);
});

console.log('Done! Output: build/autoballs-mod.zip');