// Core Constants
function GET_START_ROUND_GOLD() {
    if (GAME_MODE === 'vs' && VS_GAME) {
        if (VS_GAME.round === VS_GAME.startRound) return VS_GAME.startGameGold;
        return VS_GAME.startRoundGold;
    }
    return 10 + getModifierGoldDiff();
}

function GET_MAX_SQUAD_SIZE() {
    let squadSizeBase = 5;
    if (GAME_MODE === 'vs' && VS_GAME) {
        squadSizeBase = VS_GAME.maxSquadSize;
    }
    return squadSizeBase + getModifierSquadSizeDiff();
}

function GET_MAX_WINS() {
    return 8;
}

function GET_TIME_LIMIT() {
    if (GAME_MODE === 'vs' && VS_GAME) {
        return VS_GAME.timeLimit;
    }
    return -1;
}

function GET_SPEED_CAP_MULT() {
    if (isModifierActive('nospeedcap')) return Infinity;
    if ((GAME_MODE === 'vs' || GAME_MODE === 'spectate') && VS_GAME) {
        return VS_GAME.speedCap ? 1 : Infinity;
    }
    return 1;
}

function IS_SUBMISSION_DISABLED() {
    return !GAME_DATA || GAME_DATA.squad.name === 'test' || GAME_DATA.squad.name === 'Guest';
}

// Global
var GAME_MODE: 'mm' | 'vs' | 'spectate';
var GAME_DATA: GameData = newGameData();
var CHALLENGE_MODE_ENABLED: boolean = false;
var DAILY: API.Daily;
var SWAP_DIRECTIONS: boolean;
var ENEMY_SQUAD_DATA: API.SquadData;
var USELESS_CROWN_REPLACEMENT: boolean;
var VS_GAME: API.VSGame;

function resetData() {
    GAME_DATA = newGameData();
    
    ENEMY_SQUAD_DATA = undefined;
}

function setDataStartShop() {
    GAME_DATA.gold = GET_START_ROUND_GOLD();
    GAME_DATA.restocksThisRound = 0;
    GAME_DATA.argTrigger = { zombie: false, restocks: 0 };
    GAME_DATA.freeRestocksUntilPlay = 0;

    ENEMY_SQUAD_DATA = undefined;
}

function setDataStartShopPostEffects() {
    GAME_DATA.startShopEffects = [];
    GAME_DATA.gold = Math.max(GAME_DATA.gold, 0);

    USELESS_CROWN_REPLACEMENT = false;
}

function setDataPlay() {
    GAME_DATA.freeRestocksUntilPlay = 0;
}

function setBallPositions(world: World) {
    let squadBalls = world.select.typeAll(Ball).filter(b => b.team === 'friend' && !b.isInShop && b.state === Ball.States.PREP && b.squadIndexReference >= 0 && b.squadIndexReference < GAME_DATA.squad.balls.length);
    for (let ball of squadBalls) {
        GAME_DATA.squad.balls[ball.squadIndexReference].x = ball.x;
        GAME_DATA.squad.balls[ball.squadIndexReference].y = ball.y;
    }
}

function getNewGameId() {
    let chars = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return A.range(4).map(i => chars[Random.int(0, chars.length-1)]).join('');
}

function getLastRoundResult() {
    if (_.isEmpty(GAME_DATA.roundResults)) return 'none';

    let lastRound = M.max(Object.keys(GAME_DATA.roundResults), parseInt);
    return GAME_DATA.roundResults[lastRound];
}

function getLastWinStreak() {
    if (_.isEmpty(GAME_DATA.roundResults)) return 0;

    let lastRounds = A.sort(Object.keys(GAME_DATA.roundResults), round => parseInt(round), true);

    let wonRoundsInARow = 0;
    for (let round of lastRounds) {
        if (GAME_DATA.roundResults[round] !== 'win') break;
        wonRoundsInARow++;
    }

    return wonRoundsInARow;
}

function getLastDrawStreak() {
    if (_.isEmpty(GAME_DATA.roundResults)) return 0;

    let lastRounds = A.sort(Object.keys(GAME_DATA.roundResults), round => parseInt(round), true);

    let drawedRoundsInARow = 0;
    for (let round of lastRounds) {
        if (GAME_DATA.roundResults[round] !== 'draw') break;
        drawedRoundsInARow++;
    }

    return drawedRoundsInARow;
}

function isTierCrown() {
    return getShopTierForRound(GAME_DATA.round) > 3 && GAME_DATA.lap > 1;
}

function hasDoveBallInSquad() {
    return !!GAME_DATA.squad.balls.find(ball => ball.properties.type === 127);
}

function vsOpponentHadDoveBallInSquadLastRound() {
    return GAME_MODE === 'vs' && VS_GAME?.enemylastsquad?.balls?.find(ball => ball.properties.type === 127);
}
