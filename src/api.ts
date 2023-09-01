namespace API {
    export const VISIBLE_CORE_VERSION = 1;
    export const VISIBLE_MAJOR_VERSION = 4;
    export const VISIBLE_MINOR_VERSION = 2;
    export const VERSION = 99;
    export const BREAKING_VERSIONS = [99];  // Versions which include non-backward compatible changes, e.g. new balls, tier change
    export const BETA = true;
    export var B = 2000;

    export const ERROR_NO_SQUAD_RECEIVED = "No squad received";

    export function getFormattedVersion() {
        return `${API.VISIBLE_CORE_VERSION}.${API.VISIBLE_MAJOR_VERSION}.${API.VISIBLE_MINOR_VERSION}`;
    }

    export function cmpFormattedVersions(version1: string, version2: string) {
        let split1 = version1.split('.');
        let [coreVersion1, majorVersion1, minorVersion1] = split1.map(s => parseInt(s));
        let split2 = version2.split('.');
        let [coreVersion2, majorVersion2, minorVersion2] = split2.map(s => parseInt(s));

        if (coreVersion1 < coreVersion2) return -1;
        if (coreVersion1 > coreVersion2) return 1;
        if (majorVersion1 < majorVersion2) return -1;
        if (majorVersion1 > majorVersion2) return 1;
        if (minorVersion1 < minorVersion2) return -1;
        if (minorVersion1 > minorVersion2) return 1;
        return 0;
    }

    export type SquadData = {
        squad: Squad;
        version: number;
        gameResult?: 'win' | 'loss';
        arena: string;
    }

    export type VSGame = {
        version: number;
        allowedBallTypes: number[];
        allowedItemTypes: number[];
        frameTime: number;
        startTime: number;
        round: number;
        youarehost: boolean;
        yourname: string;
        enemyname: string;
        yourpacks: string[];
        enemypacks: string[];
        yourhealth: number;
        enemyhealth: number;
        yoursquad: Squad;
        enemysquad: Squad;
        yourlastsquad?: Squad;
        enemylastsquad?: Squad;
        lastroundresult: 'win' | 'loss' | 'draw';
        yourjoins: number;
        enemyjoins: number;
        startRound: number;
        startGameGold: number;
        startRoundGold: number;
        maxSquadSize: number;
        timeLimit: number;
        speedCap: boolean;
        arena: string;
        weekly?: Weekly;
    }

    export type LiveVersionResponse = {
        versions: {
            apiVersion: number;
            version: string;
        };
        b: number;
        bday: boolean;
        aprilFools: boolean;
        almanacExperts: string[];
        dailySchedule: string[];
    }

    export type CreateSaveResponse = {
        id: string;
        saveTime: number;
    }

    export type SaveResponse = {
        saveTime: number;
    }

    export type GetSaveResponse = {
        saveData: string;
        saveTime: number;
    }

    export type Daily = {
        day: number;
        date: string;
        seed: string;
        arena: string;
        packs: Pack[];
        modifiers: string[];
        squads: SquadData[];
        results: DailyResult[];
        version: number;
        timeToNextDailyMs: number;
        week?: number;
    }

    export type Weekly = {
        week: number;
    }

    export type DailyResult = {
        you?: boolean;
        player: string;
        wins: number;
        health: number;
        rounds: number;
        time: number;
        squad: Squad;
    }

    /* API */

    

    export const getsquad = throttledFunction("getsquad", 3000, (callback: (squad: SquadData, err: string) => void, player: string, round: number, allowProfane: boolean, bannedBallTypes: number[], lap: number, arena: string, packs: string[], week: number) => {
        httpRequestWithFallback(LAMBDA_URL, FALLBACK_LAMBDA_URL, `?operation=getsquad&player=${player}&round=${round}&allowProfane=${allowProfane}&version=${VERSION}&bannedBallTypes=${bannedBallTypes.join(',')}&lap=${lap}&onlyWinningSquads=${CHALLENGE_MODE_ENABLED}&arena=${arena}&packs=${packs.join(',')}&beta=${BETA}&week=${week}`, null, (responseJson: any, err: string) => {
            if (err) {
                callback(undefined, err);
            } else if (!responseJson || !responseJson['squad']) {
                callback(undefined, ERROR_NO_SQUAD_RECEIVED);
            } else {
                callback({ squad: responseJson['squad'], version:responseJson['version'], gameResult: responseJson['gameResult'], arena: responseJson['arena'] }, undefined);
            }
        });
    });

    export const getsquadforgame = throttledFunction("getsquadforgame", 500, (callback: (squad: SquadData, err: string) => void, gameid: string, round: number) => {
        httpRequestWithFallback(LAMBDA_URL, FALLBACK_LAMBDA_URL, `?operation=getsquadforgame&gameid=${gameid}&round=${round}`, null, (responseJson: any, err: string) => {
            if (err) {
                callback(undefined, err);
            } else if (!responseJson || !responseJson['squad']) {
                callback(undefined, ERROR_NO_SQUAD_RECEIVED);
            } else {
                callback({ squad: responseJson['squad'], version:responseJson['version'], gameResult: responseJson['gameResult'], arena: responseJson['arena'] }, undefined);
            }
        });
    });

    export const share = throttledFunction("share", 5000, (callback: (url: string, err: string) => void, player: string, gameId: string, round: number, result: 'win' | 'loss', imageData: string) => {
        httpRequestWithFallback(LAMBDA_URL, FALLBACK_LAMBDA_URL, `?operation=share&player=${player}&gameId=${gameId}&round=${round}&result=${result}&version=${VERSION}`, imageData, (responseJson: any, err: string) => {
            if (err) {
                callback(undefined, err);
            } else if (!responseJson || !responseJson['url']) {
                callback(undefined, "No url received");
            } else {
                callback(responseJson['url'], undefined);
            }
        });
    });

    

    export const getliveversion = throttledFunction("getliveversion", 1000, (callback: (reponse: LiveVersionResponse, err: string) => void) => {
        httpRequestWithFallback(LAMBDA_URL, FALLBACK_LAMBDA_URL, `?operation=getliveversion`, null, (responseJson, err) => {
            if (err) {
                callback(undefined, err);
            } else if (!responseJson || !responseJson['versions']) {
                callback(undefined, "No versions received");
            } else {
                callback(responseJson, undefined);
            }
        });
    });

    export const createvsgame = throttledFunction("createvsgame", 5000, (callback: (gameid: string, err: string) => void, player: string, lives: number, allowedBallTypes: number[], allowedItemTypes: number[], frameTime: number, profileId: string,
                                                                                                                            startRound: number, startGameGold: number, startRoundGold: number, maxSquadSize: number, timeLimit: number, speedCap: boolean, arena: string, hostPacks: string[], nonhostPacks: string[]) => {
        httpRequestWithFallback(LAMBDA_URL, FALLBACK_LAMBDA_URL, `?operation=createvsgame&player=${player}&version=${VERSION}&lives=${lives}&allowedBallTypes=${allowedBallTypes.join(',')}&allowedItemTypes=${allowedItemTypes.join(',')}&frameTime=${frameTime}&profileId=${profileId}&startRound=${startRound}&startGameGold=${startGameGold}&startRoundGold=${startRoundGold}&maxSquadSize=${maxSquadSize}&timeLimit=${timeLimit}&speedCap=${speedCap}&arena=${arena}&hostPacks=${hostPacks.join(',')}&nonhostPacks=${nonhostPacks.join(',')}`, null, (responseJson, err) => {
            if (err) {
                callback(undefined, err);
            } else if (!responseJson || !responseJson['gameid']) {
                callback(undefined, "No gameid received");
            } else {
                callback(responseJson['gameid'], undefined);
            }
        });
    });

    export const joinvsgame = throttledFunction("joinvsgame", 1000, (callback: (_: undefined, err: string) => void, gameid: string, player: string, allowedBallTypes: number[], allowedItemTypes: number[], frameTime: number, profileId: string) => {
        httpRequestWithFallback(LAMBDA_URL, FALLBACK_LAMBDA_URL, `?operation=joinvsgame&gameid=${gameid}&player=${player}&version=${VERSION}&allowedBallTypes=${allowedBallTypes.join(',')}&allowedItemTypes=${allowedItemTypes.join(',')}&frameTime=${frameTime}&profileId=${profileId}`, null, (responseJson, err) => {
            callback(undefined, err);
        });
    });

    export const getvsgame = throttledFunction("getvsgame", 1000, (callback: (vsgame: VSGame, err: string) => void, gameid: string, player: string, spectate: boolean, getLastSquads: boolean, profileId: string) => {
        httpRequestWithFallback(CONTINUOUS_LAMBDA_URL, FALLBACK_CONTINUOUS_LAMBDA_URL, `?operation=getvsgame&gameid=${gameid}&player=${player}&spectate=${spectate}&getLastSquads=${getLastSquads}&profileId=${profileId}&version=${VERSION}`, null, (responseJson, err) => {
            if (err) {
                callback(undefined, err);
            } else if (!responseJson || !responseJson['game']) {
                callback(undefined, "No game received");
            } else {
                callback(responseJson['game'], undefined);
            }
        });
    });

    export const submitvssquad = throttledFunction("submitvssquad", 1500, (callback: (_: undefined, err: string) => void, gameid: string, player: string, round: number, squad: Squad, profileId: string) => {
        httpRequestWithFallback(LAMBDA_URL, FALLBACK_LAMBDA_URL, `?operation=submitvssquad&gameid=${gameid}&player=${player}&round=${round}&squad=${encodeURIComponent(St.encodeB64S(JSON.stringify(squad)))}&version=${VERSION}&profileId=${profileId}`, null, (responseJson, err) => {
            callback(undefined, err);
        });
    });

    export const submitvsgameresult = throttledFunction("submitvsgameresult", 1500, (callback: (_: undefined, err: string) => void, gameid: string, player: string, round: number, hostresult: 'win' | 'loss' | 'draw', hostprotected: boolean, nonhostprotected: boolean, profileId: string) => {
        httpRequestWithFallback(LAMBDA_URL, FALLBACK_LAMBDA_URL, `?operation=submitvsgameresult&gameid=${gameid}&player=${player}&round=${round}&hostresult=${hostresult}&hostprotected=${hostprotected}&nonhostprotected=${nonhostprotected}&version=${VERSION}&profileId=${profileId}`, null, (responseJson, err) => {
            callback(undefined, err);
        });
    });

    

    

    

    export const getweekly = throttledFunction("getweekly", 500, (callback: (weekly: Weekly, err: string) => void) => {
        httpRequestWithFallback(LAMBDA_URL, FALLBACK_LAMBDA_URL, `?operation=getweekly`, null, (responseJson: any, err: string) => {
            if (err) {
                callback(undefined, err);
            } else if (!responseJson) {
                callback(undefined, "No weekly received");
            } else {
                callback(responseJson, undefined);
            }
        });
    });

    const LAMBDA_URL = 'https://wtqurfsgwd.execute-api.us-east-2.amazonaws.com/default/autoballs';
    const CONTINUOUS_LAMBDA_URL = 'https://0wgyeeqc32.execute-api.us-east-2.amazonaws.com/default/autoballs-continuous';
    

    const FALLBACK_LAMBDA_URL = 'https://fp52xkawjg.execute-api.us-east-2.amazonaws.com/default/undefined';
    const FALLBACK_CONTINUOUS_LAMBDA_URL = 'https://5ftlkjp3rc.execute-api.us-east-2.amazonaws.com/default/undefined';
    

    function httpRequestWithFallback(baseUrl: string, fallbackUrl: string, restOfUrl: string, data: string, callback: (responseJson: any, error: string) => any) {
        Network.httpRequest(`${baseUrl}${restOfUrl}`, data, (responseJson, err) => {
            if (!responseJson && err === '') {
                Network.httpRequest(`${fallbackUrl}${restOfUrl}`, data, callback);
            } else {
                callback(responseJson, err);
            }
        });
    }

    function throttledFunction<T extends (...params: [(result: any, err: string) => any, ...any[]]) => any>(fnName: string, maxTimeMs: number, fn: T) {
        let lastTime = 0;
        return function(...params: Parameters<T>) {
            let time = Date.now();
            if (lastTime > 0 && time - lastTime < maxTimeMs) {
                params[0](undefined, `Throttled: ${fnName}`);
                return;
            }
            lastTime = time;
            /// @ts-ignore
            fn(...params);
        }
    }
}

console.log(`Auto Balls v${API.getFormattedVersion()}${API.BETA ? ' BETA' : ''} (API version ${API.VERSION})`);