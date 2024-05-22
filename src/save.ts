/**
 * REMEMBER TO SET MERGE FUNCTIONALITY IN mergeAutoBallsDatas() !!!!
 */
type AutoBallsData = {
    name?: string;
    playerId?: string;
    vsSettings?: VSModeSettings.Settings;
    sheens?: Sheens;
    noBalls?: boolean;
    seenAlmanacComplete?: boolean;
    classicWins?: number;
    communityWins?: number;
    weeklyWins?: number;
    lastDailyCompleted?: number;

    matchmakingGameData?: MatchmakingGameData;
    challengeModeGameData?: MatchmakingGameData;
    dailyGameData?: DailyGameData;
    versusModeGameData?: VersusModeGameData;
}
/**
 * REMEMBER TO SET MERGE FUNCTIONALITY IN mergeAutoBallsDatas() !!!!
 */

type CloudSaveData = {
    data: AutoBallsData;
    ach: { [ach in AchievementName]?: number };
    almanac: { balls: DictNumber<AlmanacEntry>, items: DictNumber<AlmanacEntry> };
}

type SaveInfo = {
    saveId: string;
    saveTime: number;
}

// COMMON

function loadAllData() {
    let data = LocalStorage.getJson<AutoBallsData>(`${global.gameCodeName}_data`);
    if (!data) return {};
    return data;
}

function loadDataString(key: KeyOfType<AutoBallsData, string>, defaultValue: string): string {
    let data = loadAllData();
    let value = data[key];
    if (value === undefined) return defaultValue;
    if (!_.isString(value)) {
        console.error(`Error: data with key "${key}" expected to be a string, but is: ${value}`);
        return defaultValue;
    }
    return value;
}

function loadDataNumber(key: KeyOfType<AutoBallsData, number>, defaultValue: number): number {
    let data = loadAllData();
    let value = data[key];
    if (value === undefined) return defaultValue;
    if (!_.isNumber(value)) {
        console.error(`Error: data with key "${key}" expected to be a number, but is: ${value}`);
        return defaultValue;
    }
    return value;
}

function loadDataBoolean(key: KeyOfType<AutoBallsData, boolean>, defaultValue: boolean): boolean {
    let data = loadAllData();
    let value = data[key];
    if (value === undefined) return defaultValue;
    if (!_.isBoolean(value)) {
        console.error(`Error: data with key "${key}" expected to be a boolean, but is: ${value}`);
        return defaultValue;
    }
    return value;
}

function loadDataObject<K extends keyof AutoBallsData>(key: K, defaultValue: AutoBallsData[K]): AutoBallsData[K] {
    let data = loadAllData();
    let value = data[key];
    if (!value) return defaultValue;
    if (!_.isObject(value)) {
        console.error(`Error: data with key "${key}" expected to be an object, but is: ${value}`);
        return defaultValue;
    }
    return <AutoBallsData[K]>value;
}

function saveAllData(data: AutoBallsData) {
    LocalStorage.setJson(`${global.gameCodeName}_data`, data);
}

function saveData<K extends keyof AutoBallsData>(key: K, value: AutoBallsData[K]) {
    let data = loadAllData();
    data[key] = value;
    saveAllData(data);
}

function mergeAutoBallsDataAndSave(data: AutoBallsData) {
    let currentData = loadAllData();
    mergeAutoBallsDatas(data, currentData);
    saveAllData(currentData);
}

function mergeAutoBallsDatas(data: AutoBallsData, into: AutoBallsData) {
    into.name = data.name ?? into.name;
    into.playerId = data.playerId ?? into.playerId;
    into.vsSettings = data.vsSettings;
    into.sheens = data.sheens;
    into.noBalls = into.noBalls || data.noBalls;
    into.seenAlmanacComplete = into.seenAlmanacComplete || data.seenAlmanacComplete;
    into.classicWins = Math.max(into.classicWins || 0, data.classicWins || 0);
    into.communityWins = Math.max(into.communityWins || 0, data.communityWins || 0);
    into.weeklyWins = Math.max(into.weeklyWins || 0, data.weeklyWins || 0);
    into.lastDailyCompleted = Math.max(into.lastDailyCompleted || 0, data.lastDailyCompleted || 0);

    into.matchmakingGameData = data.matchmakingGameData;
    into.challengeModeGameData = data.challengeModeGameData;
    into.versusModeGameData = data.versusModeGameData;
    into.dailyGameData = data.dailyGameData;
}

// CLOUD SAVE

function getSaveInfo() {
    return LocalStorage.getJson<SaveInfo>(`${global.gameCodeName}_saveinfo`);
}

function setSaveInfo(save: SaveInfo) {
    LocalStorage.setJson(`${global.gameCodeName}_saveinfo`, save);
}

function createSaveInfo(saveId: string, saveTime: number) {
    let saveInfo: SaveInfo = {
        saveId: saveId,
        saveTime: saveTime,
    };
    setSaveInfo(saveInfo);
}

function setSaveTime(saveTime: number) {
    let saveInfo = getSaveInfo();
    if (!saveInfo) {
        console.error('Trying to set saveTime when save does not exist');
        return;
    }
    saveInfo.saveTime = saveTime;
    setSaveInfo(saveInfo);
}

function deleteSaveInfo() {
    LocalStorage.delete(`${global.gameCodeName}_saveinfo`);
}

function getLocalCloudSaveData(): CloudSaveData {
    return {
        data: loadAllData(),
        ach: ACHIEVEMENTS_PROGRESS,
        almanac: ALMANAC_ENTRIES,
    };
}

function mergeCloudSaveDataEncodedToLocal(saveDataEnc: string) {
    let saveData = decodeCloudSaveData(saveDataEnc);
    if (!saveData) return;
    mergeAutoBallsDataAndSave(saveData.data);
    mergeAchievementsProgressAndSave(saveData.ach);
    if (saveData.almanac) {
        mergeAlmanacEntriesAndSave(saveData.almanac);
    }
}

function mergeLocalToCloudSaveDataEncoded(saveDataEnc: string) {
    let localData = getLocalCloudSaveData();
    let cloudSaveData = decodeCloudSaveData(saveDataEnc);

    if (cloudSaveData.data) {
        mergeAutoBallsDatas(localData.data, cloudSaveData.data);
    } else {
        cloudSaveData.data = localData.data;
    }

    if (cloudSaveData.ach) {
        mergeAchievementsProgresses(localData.ach, cloudSaveData.ach);
    } else {
        cloudSaveData.ach = localData.ach;
    }

    if (cloudSaveData.almanac) {
        mergeAlmanacEntrieses(localData.almanac, cloudSaveData.almanac);
    } else {
        cloudSaveData.almanac = localData.almanac;
    }

    return encodeCloudSaveData(cloudSaveData);
}

function encodeCloudSaveData(saveData: CloudSaveData) {
    return St.encodeB64S(JSON.stringify(saveData));
}

function decodeCloudSaveData(saveDataEnc: string) {
    let saveData: CloudSaveData = JSON.parse(St.decodeB64S(saveDataEnc));
    if (!saveData || !saveData.data || !saveData.ach) return undefined;
    return saveData;
}

// NAME

function saveName(name: string) {
    saveData('name', name);
}

function loadName() {
    return loadDataString('name', undefined);
}

// PLAYER ID

function loadPlayerId() {
    let playerId = loadDataString('playerId', undefined);
    if (!playerId) {
        playerId = new UIDGenerator().generate();
        saveData('playerId', playerId);
    }
    return playerId;
}

// VS SETTINGS

function saveVsSettings(vsSettings: VSModeSettings.Settings) {
    saveData('vsSettings', vsSettings);
}

function loadVsSettings() {
    let defaults = VSModeSettings.GET_DEFAULT_SETTINGS();
    let settings = loadDataObject('vsSettings', defaults);
    _.defaults(settings, defaults);

    if (settings && settings.arena === Arenas.ARENA_BDAY && !LiveVersion.BDAY_VS) {
        settings.arena = defaults.arena;
    }

    return settings;
}

// SHEENS

function saveSheens(sheens: Sheens) {
    saveData('sheens', sheens);
}

function loadSheens() {
    let sheens = loadDataObject('sheens', {});

    if (!Object.keys(sheens).every(k => _.isString(sheens[k]) && sheens[k].split('.').length === 3)) {
        sheens = {};
    }

    _.defaults(sheens, DEFAULT_SHEENS);

    return sheens;
}

// NO BALLS

function saveNoBalls(noBalls: boolean) {
    saveData('noBalls', noBalls);
}

function loadNoBalls() {
    return loadDataBoolean('noBalls', false);
}

// ALMANAC COMPLETE

function saveSeenAlmanacComplete(almanacComplete: boolean) {
    saveData('seenAlmanacComplete', almanacComplete);
}

function loadSeenAlmanacComplete() {
    return loadDataBoolean('seenAlmanacComplete', false);
}

// PACK WINS

function saveWins(pack: Pack, wins: number) {
    let key: 'classicWins' | 'communityWins' | 'weeklyWins' = pack === 'community' ? 'communityWins' : (pack === 'weekly' ? 'weeklyWins' : 'classicWins');
    saveData(key, wins);
}

function loadWins(pack: Pack) {
    let key: 'classicWins' | 'communityWins' | 'weeklyWins' = pack === 'community' ? 'communityWins' : (pack === 'weekly' ? 'weeklyWins' : 'classicWins');
    let wins = loadDataNumber(key, undefined);
    if (wins === undefined) {
        if (pack === 'classic') {
            let existingWins = ACHIEVEMENTS_PROGRESS.WinGame;
            wins = existingWins;
            saveWins(pack, wins);
        } else {
            wins = 0;
        }
    }
    return wins;
}

// LAST DAILY COMPLETED

function saveLastDailyCompleted(day: number) {
    saveData('lastDailyCompleted', day);
}

function loadLastDailyCompleted() {
    return loadDataNumber('lastDailyCompleted', -99);
}