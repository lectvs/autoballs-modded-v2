type Sheens = {
    howToPlay?: string;
    unlockables?: string;
    almanac?: string;
    discord?: string;
    twitter?: string;
    patchNotes?: string;
}

const DEFAULT_SHEENS: Sheens = {
    howToPlay: '0.0.0',
    unlockables: '0.0.0',
    almanac: '0.0.0',
    discord: '0.0.0',
    twitter: '0.0.0',
    patchNotes: '0.0.0',
};

var SHEENS_LAST_UPDATED = {
    howToPlay: '1.1.0',
    unlockables: '1.4.2',
    almanac: '1.4.2',
    discord: '1.4.2',
    twitter: '1.4,2',
    patchNotes: '1.4.2',
};

function shouldSheen(sheen: keyof Sheens) {
    let sheens = loadSheens();
    if (!sheens[sheen] || !SHEENS_LAST_UPDATED[sheen]) return false;
    return API.cmpFormattedVersions(sheens[sheen], SHEENS_LAST_UPDATED[sheen]) < 0;
}

function setSheenSeen(sheen: keyof Sheens, seen: boolean) {
    let sheens = loadSheens();
    sheens[sheen] = seen ? `${API.VISIBLE_CORE_VERSION}.${API.VISIBLE_MAJOR_VERSION}.${API.VISIBLE_MINOR_VERSION}` : '0.0.0';
    saveSheens(sheens);
}
