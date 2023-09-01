type AlmanacEntry = {
    wins: number;
}

var ALMANAC_ENTRIES: {
    balls: DictNumber<AlmanacEntry>;
    items: DictNumber<AlmanacEntry>;
} = {
    balls: {},
    items: {},
};

const ALMANAC_EXCLUDED_BALLS = [
    0,   // Normal
    20,  // Thief
    31,  // Bio-Grenade (old)
    41,  // Glitched Ball ARG
    77,  // Pinata
    142, // Greater Mimic
];

const ALMANAC_EXCLUDED_ITEMS = [
    16,  // Mini Polisher
    25,  // Glitched Item
    32,  // Scribbled Map
    38,  // Birthday Cake
    39,  // Gift
];

function getAlmanacDisplayedBallTypes(pack: Pack, weekly: { week: number }) {
    let ballTypeList = getAllBallTypesForPack(pack, weekly).filter(type => {
        if (_.contains(ALMANAC_EXCLUDED_BALLS, type)) return false;
        if (type === 42 && !isBallTypeUnlocked(42)) return false;  // Glitched Ball
        return true;
    });

    A.sort(ballTypeList, type => TYPE_TO_BALL_TYPE_DEF[type].tier);

    return ballTypeList;
}

function getAlmanacDisplayedItemTypes() {
    let itemTypeList = Object.keys(TYPE_TO_ITEM_TYPE_DEF).map(type => parseInt(type)).filter(type => {
        if (_.contains(ALMANAC_EXCLUDED_ITEMS, type)) return false;
        return true;
    });

    A.sort(itemTypeList, type => TYPE_TO_ITEM_TYPE_DEF[type].tier);

    return itemTypeList;
}

function clearAlmanacEntries() {
    ALMANAC_ENTRIES = {
        balls: {},
        items: {},
    };
    saveAlmanacEntries();
}

function seeAllAlmanacEntries() {
    for (let type in TYPE_TO_BALL_TYPE_DEF) {
        seeAlmanacBall(<any>type);
    }
    for (let type in TYPE_TO_ITEM_TYPE_DEF) {
        seeAlmanacItem(<any>type);
    }
}

function winAllAlmanacEntries() {
    for (let type in TYPE_TO_BALL_TYPE_DEF) {
        addAlmanacBallWin(<any>type);
    }
    for (let type in TYPE_TO_ITEM_TYPE_DEF) {
        addAlmanacItemWin(<any>type);
    }
}

function restoreCompleteAlmanac() {
    for (let type in TYPE_TO_BALL_TYPE_DEF) {
        if (getAlmanacBallEntry(<any>type).wins > 0) continue;
        addAlmanacBallWin(<any>type);
    }
    for (let type in TYPE_TO_ITEM_TYPE_DEF) {
        if (getAlmanacItemEntry(<any>type).wins > 0) continue;
        addAlmanacItemWin(<any>type);
    }
    updateAchievementProgress('CompleteTheBallmanac', p=>1);
    saveSeenAlmanacComplete(true);
}

function setAllAlmanacEntriesRandom() {
    clearAlmanacEntries();
    let weights = [0.2, 0.4, 0.25, 0.1, 0.05];
    for (let type in TYPE_TO_BALL_TYPE_DEF) {
        let entry = getAlmanacBallEntry(<any>type);
        entry.wins = Random.elementWeighted([-1, 0, 1, 2, 3], weights);
    }
    for (let type in TYPE_TO_ITEM_TYPE_DEF) {
        let entry = getAlmanacItemEntry(<any>type);
        entry.wins = Random.elementWeighted([-1, 0, 1, 2, 3], weights);
    }
    saveAlmanacEntries();
}

function getAlmanacBallEntry(ballType: number, from: any = ALMANAC_ENTRIES) {
    if (!(ballType in from.balls)) {
        from.balls[ballType] = {
            wins: -1,
        };
    }
    return from.balls[ballType];
}

function getAlmanacItemEntry(itemType: number, from: any = ALMANAC_ENTRIES) {
    if (!(itemType in from.items)) {
        from.items[itemType] = {
            wins: -1,
        };
    }
    return from.items[itemType];
}

function seeAlmanacBall(ballType: number) {
    let entry = getAlmanacBallEntry(ballType);
    if (entry.wins < 0) entry.wins = 0;
    saveAlmanacEntries();
}

function seeAlmanacItem(itemType: number) {
    let entry = getAlmanacItemEntry(itemType);
    if (entry.wins < 0) entry.wins = 0;
    saveAlmanacEntries();
}

function hasSeenAlmanacBall(ballType: number) {
    return getAlmanacBallEntry(ballType).wins >= 0;
}

function hasSeenAlmanacItem(itemType: number) {
    return getAlmanacItemEntry(itemType).wins >= 0;
}

function addAlmanacBallWin(ballType: number) {
    seeAlmanacBall(ballType);
    getAlmanacBallEntry(ballType).wins++;
    saveAlmanacEntries();
}

function addAlmanacItemWin(itemType: number) {
    seeAlmanacItem(itemType);
    getAlmanacItemEntry(itemType).wins++;
    saveAlmanacEntries();
}

function getAlmanacBallWinCount(ballType: number) {
    let entry = getAlmanacBallEntry(ballType);
    return entry.wins >= 0 ? entry.wins : 0;
}

function getAlmanacItemWinCount(itemType: number) {
    let entry = getAlmanacItemEntry(itemType);
    return entry.wins >= 0 ? entry.wins : 0;
}

function getAlmanacEntriesCompleted() {
    let count = 0;
    for (let pack of OFFICIAL_PACKS) {
        let ballTypes = getAlmanacDisplayedBallTypes(pack, undefined);
        let completedBallTypes = ballTypes.filter(type => getAlmanacBallWinCount(type) > 0);
        count += completedBallTypes.length;
    }
    let itemTypes = getAlmanacDisplayedItemTypes();
    let completedItemTypes = itemTypes.filter(type => getAlmanacItemWinCount(type) > 0);
    count += completedItemTypes.length;
    return count;
}

function getAlmanacBallCompletionPercent(pack: Pack, weekly: { week: number }) {
    let ballTypes = getAlmanacDisplayedBallTypes(pack, weekly);
    let completedBallTypes = ballTypes.filter(type => getAlmanacBallWinCount(type) > 0);
    return completedBallTypes.length / ballTypes.length;
}

function getAlmanacItemCompletionPercent() {
    let itemTypes = getAlmanacDisplayedItemTypes();
    let completedItemTypes = itemTypes.filter(type => getAlmanacItemWinCount(type) > 0);
    return completedItemTypes.length / itemTypes.length;
}

function getAlmanacTotalCompletionPercent() {
    let classicBallTypes = getAlmanacDisplayedBallTypes('classic', undefined);
    let communityBallTypes = getAlmanacDisplayedBallTypes('community', undefined);
    let itemTypes = getAlmanacDisplayedItemTypes();

    let seen = 0;
    let won = 0;
    let total = 0;

    for (let type of [...classicBallTypes, ...communityBallTypes]) {
        if (hasSeenAlmanacBall(type)) seen++;
        if (getAlmanacBallWinCount(type) > 0) won++;
        total++;
    }

    for (let type of itemTypes) {
        if (hasSeenAlmanacItem(type)) seen++;
        if (getAlmanacItemWinCount(type) > 0) won++;
        total++;
    }

    return { seen: seen / total, won: won / total };
}

function isAlmanacComplete() {
    return getAlmanacTotalCompletionPercent().won >= 1;
}

function saveAlmanacEntries() {
    LocalStorage.setString(`${global.gameCodeName}_almanac`, btoa(JSON.stringify(ALMANAC_ENTRIES)));
}

function loadAlmanacEntries() {
    let almanacString = LocalStorage.getString(`${global.gameCodeName}_almanac`);
    if (!almanacString) return;
    let almanacEntries = JSON.parse(atob(almanacString));

    mergeAlmanacEntrieses(almanacEntries, ALMANAC_ENTRIES);
}

function mergeAlmanacEntriesAndSave(almanacEntries: any) {
    mergeAlmanacEntrieses(almanacEntries, ALMANAC_ENTRIES);
    saveAlmanacEntries();
}

function mergeAlmanacEntrieses(almanacEntries: any, into: any) {
    if (!almanacEntries || !_.isObject(almanacEntries) || !_.isObject(almanacEntries.balls) || !_.isObject(almanacEntries.items)) {
        return;
    }

    for (let type in almanacEntries.balls) {
        if (!_.isObject(almanacEntries.balls[type]) || !_.isNumber(almanacEntries.balls[type].wins)) continue;
        let entry = getAlmanacBallEntry(<any>type, into);
        entry.wins = Math.max(entry.wins, almanacEntries.balls[type].wins);
    }

    for (let type in almanacEntries.items) {
        if (!_.isObject(almanacEntries.items[type]) || !_.isNumber(almanacEntries.items[type].wins)) continue;
        let entry = getAlmanacItemEntry(<any>type, into);
        entry.wins = Math.max(entry.wins, almanacEntries.items[type].wins);
    }
}

function updateAlmanacEntriesSeen(world: World) {
    if (!youArePlaying(world)) return;
    
    let balls = world.select.typeAll(Ball);
    for (let ball of balls) {
        seeAlmanacBall(ball.properties.type);
    }

    let items = world.select.typeAll(BallItem);
    for (let item of items) {
        seeAlmanacItem(item.type);
    }

    let equipments = world.select.typeAll(Equipment);
    for (let equipment of equipments) {
        seeAlmanacItem(getItemTypeForEquipmentType(equipment.equipmentType));
    }
}