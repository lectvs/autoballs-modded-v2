// IF YOU ADD A NEW FIELD HERE, ADD IT TO fixGameDataFromPreviousVersion() BELOW!!!
type GameData = {
    apiVersion: number;
    gameId: string;
    arena: string;
    wins: number;
    health: number;
    round: number;
    lap: number;
    packs: Pack[];
    modifiers: string[];
    squad: Squad;
    shopMusic: string;
    battleMusic: string;
    availableBallTypes: number[] | undefined;
    availableItemTypes: number[] | undefined;
    weekly: { week: number };

    // Shop
    startShopEffects: StartShopEffect[];
    restockQueue: { restocksLeft: number, ball: SquadBallProperties }[];
    frozenThings: Shop.FrozenThing[];
    gold: number;
    restocksThisRound: number;
    freeRestocksUntilPlay: number;
    hasPurchasedDove: boolean;
    bankedGold: { squadIndex: number, goldPerRound: number, roundsLeft: number }[];
    hasBuggedSquad: boolean;

    // Stats
    roundResults: Dict<'win' | 'loss' | 'draw'>;
    gameTime: number;
    offlineCount: number;
    playersWhoBeatYou: string[];

    // Achievements
    hasBoughtEquipment: boolean;
    hasFrozen: boolean;
    hasRestocked: boolean;
    hasLostRound: boolean;
    hasLeveledUp: boolean;
    hasSold: boolean;
    hasBoughtItem: boolean;

    // Almanac
    ballTypesForAlmanacWin: number[];
    itemTypesForAlmanacWin: number[];

    // ARG
    argTrigger: { zombie: boolean, restocks: number };
    arg2Trigger: { strategy: boolean };
}
// IF YOU ADD A NEW FIELD HERE, ADD IT TO fixGameDataFromPreviousVersion() BELOW!!!


type MatchmakingGameData = {
    gameData: GameData;
    state: 'startshop' | 'midshop' | 'play' | 'battle' | 'result';
    lock: GameDataLock;
    // 'battle' data
    enemySquadData?: API.SquadData;
    isEnemySquadBot?: boolean;
    // 'result' data
    roundResult?: 'win' | 'loss' | 'draw';
}

type DailyGameData = {
    matchmakingGameData: MatchmakingGameData;
    day: number;
}

type VersusModeGameData = {
    gameData: GameData;
    state: 'startshop' | 'midshop' | 'battle' | 'result';
    lastPingTime: number;
}

type GameDataLock = {
    lockSessionId: string;
    ms: number;
}

function newGameData(): GameData {
    let gameId = getNewGameId();
    return {
        apiVersion: API.VERSION,
        gameId: gameId,
        arena: Arenas.ARENA_FIRST,
        wins: 0,
        health: 4,
        round: 1,
        lap: 1,
        packs: ['classic'],
        modifiers: [],
        squad : {
            name: 'Unknown',
            balls: [],
        },
        shopMusic: selectRandomShopMusic(gameId),
        battleMusic: selectRandomBattleMusic(gameId),
        availableBallTypes: undefined,
        availableItemTypes: undefined,
        weekly: undefined,

        startShopEffects: [],
        restockQueue: [],
        frozenThings: [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        gold: 10,
        restocksThisRound: 0,
        freeRestocksUntilPlay: 0,
        hasPurchasedDove: false,
        bankedGold: [],
        hasBuggedSquad: false,

        roundResults: {},
        gameTime: 0,
        offlineCount: 0,
        playersWhoBeatYou: [],

        hasBoughtEquipment: false,
        hasFrozen: false,
        hasRestocked: false,
        hasLostRound: false,
        hasLeveledUp: false,
        hasSold: false,
        hasBoughtItem: false,

        ballTypesForAlmanacWin: [],
        itemTypesForAlmanacWin: [],

        argTrigger: { zombie: false, restocks: 0 },
        arg2Trigger: { strategy: false },
    };
}

function fixGameDataFromPreviousVersion(gameData: GameData) {
    if (!gameData.bankedGold) gameData.bankedGold = [];
}

// Matchmaking

function saveMatchmakingOrChallengeModeOrDailyGameData(gameData: MatchmakingGameData, challengeMode: boolean, daily: API.Daily) {
    if (daily) {
        saveData('dailyGameData', {
            matchmakingGameData: gameData,
            day: daily.day,
        });
        return;
    }

    if (challengeMode) {
        saveData('challengeModeGameData', gameData);
        return;
    }

    saveData('matchmakingGameData', gameData);
}

function loadMatchmakingGameData() {
    let data = loadDataObject('matchmakingGameData', undefined);
    fillInGameData(data?.gameData);
    return data;
}

function loadChallengeModeGameData() {
    let data = loadDataObject('challengeModeGameData', undefined);
    fillInGameData(data?.gameData);
    return data;
}

function loadDailyGameData(currentDay: number) {
    let data = loadDataObject('dailyGameData', undefined);
    if (!data || !data.matchmakingGameData || data.day !== currentDay) {  // Daily is only valid on the day it is ran.
        return undefined;
    }
    fillInGameData(data.matchmakingGameData.gameData);
    return data;
}

function fillInGameData(gameData: GameData) {
    if (!gameData) return;
    if (!gameData.modifiers) gameData.modifiers = [];
}

// Versus Mode

function saveVersusModeGameData(gameData: Omit<VersusModeGameData, 'lastPingTime'>) {
    saveData('versusModeGameData', gameData ? {
        ...gameData,
        lastPingTime: Date.now(),
    } : undefined);
}

function loadVersusModeGameData(config: { type: 'last' } | { type: 'current', gameid: string }) {
    let gameData = loadDataObject('versusModeGameData', undefined);

    if (!gameData || Date.now() - gameData.lastPingTime > 3600000) {
        return undefined;  // Valid time is one hour
    }

    if (config.type === 'current' && (!gameData.gameData || gameData.gameData.gameId !== config.gameid)) {
        return undefined;  // Game Id doesn't match
    }

    return gameData;
}

function addBallTypeForAlmanacWin(ballType: number) {
    if (_.contains(GAME_DATA.ballTypesForAlmanacWin, ballType)) return;
    GAME_DATA.ballTypesForAlmanacWin.push(ballType);
}

function addItemTypeForAlmanacWin(itemType: number) {
    if (_.contains(GAME_DATA.itemTypesForAlmanacWin, itemType)) return;
    GAME_DATA.itemTypesForAlmanacWin.push(itemType);
}

function getApiVersionForSquadSubmit(gameData: GameData) {
    if (!gameData.apiVersion) return undefined;
    if (gameData.apiVersion === API.VERSION) return API.VERSION;
    if (gameData.apiVersion > API.VERSION) return undefined;

    for (let v = gameData.apiVersion+1; v <= API.VERSION; v++) {
        if (_.includes(API.BREAKING_VERSIONS, v)) return undefined;
    }

    return gameData.apiVersion;
}

function getRandomSeed(gameId: string, daily: API.Daily) {
    if (daily) return daily.seed;
    return gameId;
}

let lockSessionId = new UIDGenerator().generate();
function gameDataLock(): GameDataLock {
    return {
        lockSessionId: lockSessionId,
        ms: Date.now(),
    };
}
