namespace RoundResults {
    export function RESULT_CHECK(): Script.Function {
        return function*() {
            let delayResolveObjects: WorldObject[] = [];
            let lastDelayResolveObjects: WorldObject[] = [];
            let executedOnEndGameBeforeDelayResolveObjects = false;
            let foundDelayResolveObjects = false;
            while (true) {
                yield;
                if (!isStartOfEndOfGame()) {
                    foundDelayResolveObjects = false;
                    continue;
                }

                yield;

                let battleTimer = global.world.select.type(BattleTimer);
                let balls = global.world.select.typeAll(Ball);

                if (!executedOnEndGameBeforeDelayResolveObjects) {
                    for (let ball of balls) {
                        ball.onEndGameBeforeDelayResolveObjects();
                    }
                    executedOnEndGameBeforeDelayResolveObjects = true;
                }

                if (!foundDelayResolveObjects) {
                    delayResolveObjects = getDelayResolveObjects(global.world);
                    foundDelayResolveObjects = true;
                }

                delayResolveObjects = delayResolveObjects.filter(dro => dro.world && getDelayResolveObjectTeam(dro));

                let roundResult = getRoundResult(battleTimer, balls, delayResolveObjects, lastDelayResolveObjects);

                if (roundResult.ongoing) {
                    lastDelayResolveObjects = getDelayResolveObjects(global.world);
                    continue;
                }

                debug('Started end of game with result', roundResult, 'and delayResolveObjects', delayResolveObjects);

                global.theater.runScript(function*() {
                    global.theater.select.type(BattleSpeedController).enabled = false;
                    battleTimer.setActive(false);
                    global.game.allowPauseWithPauseKey = false;
                    let gearButton = global.world.select.name('gear', false)?.getModule(Button);
                    if (gearButton) gearButton.enabled = false;

                    yield slowWorldAndFade();
    
                    // Reevaluate the round result after the fade finishes
                    balls = global.world.select.typeAll(Ball);
                    roundResult = getRoundResult(battleTimer, balls, [], []);
    
                    debug('Real round result:', roundResult);
    
                    // Do end of battle abilities
                    for (let ball of balls) {
                        if (ball.team !== 'friend') continue;
                        ball.queueAbilities('onSurviveBattle');
                    }
                    global.world.select.type(AbilitySystem, false)?.activateAbilities();
    
                    if (roundResult.result === 'loss' && ENEMY_SQUAD_DATA && !_.includes(GAME_DATA.playersWhoBeatYou, ENEMY_SQUAD_DATA.squad.name)) {
                        GAME_DATA.playersWhoBeatYou.push(ENEMY_SQUAD_DATA.squad.name);
                    }
    
                    yield playCutsceneForRoundResult(roundResult.result, roundResult.isTimeout);
                });

                break;
            }
        }
    }

    function isStartOfEndOfGame() {
        let battleTimer = global.world.select.type(BattleTimer);
        if (battleTimer && battleTimer.battleTime > 60) return true;

        let delayResolveObjects = getDelayResolveObjects(global.world);
        if (existsOngoingDelayResolveObjects(undefined, delayResolveObjects, [])) return false;

        let balls = global.world.select.typeAll(Ball);
        if (balls.length === 0) return true;
        if (balls.every(ball => ball.team === 'friend' || ball.team === 'neutral')) return true;
        if (balls.every(ball => ball.team === 'enemy' || ball.team === 'neutral')) return true;
        return false;
    }

    function getRoundResult(battleTimer: BattleTimer, balls: Ball[], delayResolveObjects: WorldObject[], lastDelayResolveObjects: WorldObject[])
                            : { result: 'win' | 'loss' | 'draw', ongoing: boolean, isTimeout: boolean } {

        let result: 'win' | 'loss' | 'draw';
        let ongoing: boolean;
        let isTimeout = false;
        let winningTeam: Ball.Team;
        if (balls.length === 0 || balls.every(ball => ball.team === 'neutral')) {
            result = 'draw';
            ongoing = false;
        } else if (balls.every(ball => ball.team === 'friend' || ball.team === 'neutral')) {
            result = 'win';
            ongoing = false;
            winningTeam = 'friend';
        } else if (balls.every(ball => ball.team === 'enemy' || ball.team === 'neutral')) {
            result = 'loss';
            ongoing = false;
            winningTeam = 'enemy';
        } else {
            result = 'draw';
            ongoing = true;
        }

        if (battleTimer && battleTimer.battleTime > 60) {
            ongoing = false;
            isTimeout = true;
        } else if (existsOngoingDelayResolveObjects(winningTeam, delayResolveObjects, lastDelayResolveObjects)) {
            ongoing = true;
        }

        return { result, ongoing, isTimeout };
    }

    function existsOngoingDelayResolveObjects(winningTeam: Ball.Team, delayResolveObjects: WorldObject[], lastDelayResolveObjects: WorldObject[]) {
        let existsLosingTeamDelayResolveObjects = winningTeam && [...delayResolveObjects, ...lastDelayResolveObjects].some(dro => {
            let droTeam = getDelayResolveObjectTeam(dro);
            return droTeam !== winningTeam && droTeam !== 'neutral';
        });

        let existsForceDelayResolveObjects = [...delayResolveObjects, ...lastDelayResolveObjects].some(dro => {
            return dro.hasTag(Tags.FORCE_DELAY_RESOLVE);
        });

        return existsLosingTeamDelayResolveObjects || existsForceDelayResolveObjects;
    }

    function playCutsceneForRoundResult(roundResult: 'win' | 'loss' | 'draw', isTimeout: boolean) {
        return function*() {
            let roundResultError = false;
            if (GAME_MODE === 'vs' || GAME_MODE === 'spectate') {
                if (VS_GAME.youarehost && GAME_MODE !== 'spectate') {
                    yield submitHostRoundResult(roundResult);
                } else {
                    let result: { roundResult?: 'win' | 'loss' | 'draw' } = {};
                    yield waitForVSHostRoundResult(result);
                    roundResultError = (result.roundResult !== roundResult);
                    roundResult = result.roundResult;
                }
                yield S.wait(1);

                if (roundResultError) {
                    
                    yield showRoundResultError();
                    yield S.wait(1);
                }
            }

            if (roundResult === 'draw') {
                let drawType: 'timeout' | 'normal' = isTimeout ? 'timeout' : 'normal';
                if (GAME_MODE === 'spectate') {
                    global.theater.playCutscene(SPECTATE_RESULT(null, drawType));
                } else {
                    global.theater.playCutscene(DRAW(drawType));
                }
            } else if (roundResult === 'win') {
                if (GAME_MODE === 'spectate') {
                    if (VS_GAME.yourhealth <= 0 || VS_GAME.enemyhealth <= 0) {
                        global.theater.playCutscene(VICTORY);
                    } else {
                        global.theater.playCutscene(SPECTATE_RESULT(VS_GAME.yourname, null));
                    }
                } else if (GAME_DATA.wins + 1 >= GET_MAX_WINS() && !vsOpponentHadDoveBallInSquadLastRound()) {
                    global.theater.playCutscene(VICTORY);
                } else {
                    global.theater.playCutscene(WIN);
                }
            } else if (roundResult === 'loss') {
                if (GAME_MODE === 'spectate') {
                    if (VS_GAME.yourhealth <= 0 || VS_GAME.enemyhealth <= 0) {
                        global.theater.playCutscene(GAMEOVER);
                    } else {
                        global.theater.playCutscene(SPECTATE_RESULT(VS_GAME.enemyname, null));
                    }
                } else if (GAME_DATA.health - 1 <= 0 && !hasDoveBallInSquad()) {
                    global.theater.playCutscene(GAMEOVER);
                } else {
                    global.theater.playCutscene(LOSE);
                }
            }
        }
    }

    export const VICTORY: Cutscene = {
        script: function*() {
            let priorLap = GAME_DATA.lap;
            let priorWins = GAME_DATA.wins;
            let priorHealth = GAME_DATA.health;
            let priorRound = GAME_DATA.round;

            if (youArePlaying(global.world)) {
                GAME_DATA.roundResults[GAME_DATA.round] = 'win';

                GAME_DATA.round++;
                GAME_DATA.wins++;
                if (GAME_MODE === 'mm') {
                    GAME_DATA.lap++;
                    GAME_DATA.wins = 0;
                    GAME_DATA.health = M.clamp(GAME_DATA.health+1, 1, 4);
                }
            }

            if (GAME_MODE === 'vs') {
                saveVersusModeGameData(undefined);
            } else if (!DAILY) {
                saveEndOfRoundGameData('win');
            }

            let timeScale = getBattleTransitionTimeScale();

            let dailySubmissionResult: { success?: boolean } = { success: true };

            if (youArePlaying(global.world)) {
                if (priorLap === 1) {
                    if (GAME_MODE === 'mm') {
                        for (let pack of GAME_DATA.packs) {
                            let wins = loadWins(pack);
                            saveWins(pack, wins+1);
                        }
                    }
    
                    let hasRefreshedGame = GAME_MODE === 'vs' && VS_GAME && VS_GAME.yourjoins > 1;
    
                    updateAchievementProgress('WinGame', p => p+1);
                    updateAchievementProgress('PlayFiveGames', p => p+1);

                    if (GAME_DATA.squad.balls.length <= 3) {
                        updateAchievementProgress('VictoryWithTwoBalls', p => p+1);
                    }
    
                    if (GAME_DATA.squad.balls.length <= 1) {
                        updateAchievementProgress('OneBall', p => p+1);
                    }
    
                    if (GAME_DATA.gameTime <= 900 && !hasRefreshedGame) {
                        updateAchievementProgress('WinInTenMinutes', p => p+1);
                    }
    
                    if (!GAME_DATA.hasBoughtEquipment && !hasRefreshedGame) {
                        updateAchievementProgress('WinWithoutEquipment', p => p+1);
                    }
    
                    if (!GAME_DATA.hasFrozen && !hasRefreshedGame) {
                        updateAchievementProgress('WinWithoutFreezing', p => p+1);
                    }
    
                    if (!GAME_DATA.hasRestocked && !hasRefreshedGame) {
                        updateAchievementProgress('NoRestocks', p => p+1);
                    }
    
                    if (!GAME_DATA.hasLeveledUp && !hasRefreshedGame) {
                        updateAchievementProgress('NoLevelUp', p => p+1);
                    }
    
                    if (!GAME_DATA.hasSold && !hasRefreshedGame) {
                        updateAchievementProgress('NoSell', p => p+1);
                    }
    
                    if (!GAME_DATA.hasBoughtItem && !hasRefreshedGame) {
                        updateAchievementProgress('NoItems', p => p+1);
                    }
    
                    if (!GAME_DATA.hasLostRound && !hasRefreshedGame) {
                        updateAchievementProgress('WinWithoutLosing', p => p+1);
                    }
    
                    if (GAME_DATA.squad.balls.some(ball => ball.properties.type === 41)) {
                        updateAchievementProgress('WinWithGlitchedBall', p => p+1);
                    }
    
                    if (GAME_MODE === 'vs') {
                        updateAchievementProgress('WinVSGame', p => p+1);
                    }
    
                    if (GAME_MODE === 'mm' && CHALLENGE_MODE_ENABLED) {
                        updateAchievementProgress('WinChallengeMode', p => p+1);
                    }
    
                    if (global.world.data.arenaName === Arenas.ARENA_BDAY || GAME_DATA.arena === Arenas.ARENA_BDAY) {
                        updateAchievementProgress('WinBirthdayMode', p => p+1);
                    }
    
                    if (GAME_DATA.squad.balls.some(ball => ball.properties.type === 127)) {
                        updateAchievementProgress('PeaceWasNeverAnOption', p => p+1);
                    }
    
                    if (DAILY) {
                        updateAchievementProgress('WinDaily', p => p+1);
                    }

                    if (_.includes(GAME_DATA.packs, 'weekly')) {
                        updateAchievementProgress('WinWeekly', p => p+1);
                    }
    
                    updateWinRoundAchievements();
                    updatePlayRoundAchievements();
    
                    if (GAME_MODE === 'mm') {
                        updateAlmanacEntriesForWin();
                    }
                }

                if (priorLap > 1) {
                    updateAchievementProgress('CompleteVictoryLap', p => p+1);
                }
    
                if (priorLap > 2) {
                    updateAchievementProgress('CompleteTwoVictoryLaps', p => p+1);
                }

                if (USELESS_CROWN_REPLACEMENT) {
                    updateAchievementProgress('Useless', p => p+1);
                    USELESS_CROWN_REPLACEMENT = false;
                }
    
                
            }

            let inVictoryLap = priorLap > 1;
            let dailyFailed = DAILY && !dailySubmissionResult.success;
            if (GAME_MODE === 'mm' && !inVictoryLap && !dailyFailed) {
                saveMatchmakingOrChallengeModeOrDailyGameData(undefined, CHALLENGE_MODE_ENABLED, DAILY);
            } 

            Persist.persist();

            let result: { continueSelection?: 'continue' | 'victorylap' } = {};
            if (GAME_MODE === 'vs' || GAME_MODE === 'spectate') {
                yield EndScreens.showVsResult();
                result.continueSelection = 'continue';
            } else {
                yield EndScreens.showVictory(priorLap, priorWins, priorHealth, priorRound, result);
            }

            if (result.continueSelection === 'victorylap') {
                let vignette = global.world.addWorldObject(new Sprite({
                    texture: 'vignette',
                    tint: 0xFFD800,
                    alpha: 0,
                }));

                global.theater.playSound('impact');
                global.theater.playSound('freeze', { humanized: false });
                yield S.tween(0.5, vignette, 'alpha', 0, 0.8, Tween.Easing.OutBounce(2));

                yield S.wait(1*timeScale);

                let currentHeaderText = global.world.select.name<SpriteText>('wintext');
                if (currentHeaderText) {
                    currentHeaderText.setText(currentHeaderText.getCurrentText().replace(/\[r\]<heart>\[\/r\] [0-9]+ /, `[r]<heart>[/r] [gold]${GAME_DATA.health}[/gold] `));
                    global.world.playSound('buff', { humanized: false });
                }

                yield S.wait(2*timeScale);

                global.theater.loadStage(Stages.PREP, transition());
            } else if (GAME_DATA.arg2Trigger.strategy) {
                global.theater.runScript(function*() {
                    yield;
                    global.theater.playCutscene(ARG.Cutscenes.BEGIN_ARG_2);
                });
            } else if (isBallmanacToComplete()) {
                global.theater.runScript(function*() {
                    yield;
                    global.theater.playCutscene(COMPLETE_ALMANAC_CUTSCENE);
                });
            } else if (DAILY) {
                yield S.fadeOut(1, 0x000000);
                yield S.wait(1);

                global.game.loadMainMenu();
                global.game.startGame(() => DailyScreen.STAGE());
            } else {
                yield S.fadeOut(1, 0x000000);
                yield S.wait(1);
    
                global.game.loadMainMenu();
            }
        }
    }

    export const GAMEOVER: Cutscene = {
        script: function*() {
            if (youArePlaying(global.world)) {
                GAME_DATA.roundResults[GAME_DATA.round] = 'loss';
                GAME_DATA.hasLostRound = true;

                GAME_DATA.round++;
                GAME_DATA.health--;
            }

            if (GAME_MODE === 'vs') {
                saveVersusModeGameData(undefined);
            } else if (!DAILY) {
                saveMatchmakingOrChallengeModeOrDailyGameData(undefined, CHALLENGE_MODE_ENABLED, DAILY);
            }

            let dailySubmissionResult: { success?: boolean } = { success: true };

            if (youArePlaying(global.world)) {
                updateAchievementProgress('PlayFiveGames', p => p+1);

                if (USELESS_CROWN_REPLACEMENT) {
                    updateAchievementProgress('Useless', p => p+1);
                    USELESS_CROWN_REPLACEMENT = false;
                }

                updatePlayRoundAchievements();

                
            }

            if (GAME_MODE === 'mm' && (!DAILY || dailySubmissionResult.success)) {
                saveMatchmakingOrChallengeModeOrDailyGameData(undefined, CHALLENGE_MODE_ENABLED, DAILY);
            }

            Persist.persist();

            if (GAME_MODE === 'vs' || GAME_MODE === 'spectate') {
                yield EndScreens.showVsResult();
            } else {
                yield EndScreens.showGameOver();
            }

            if (GAME_DATA.arg2Trigger.strategy) {
                global.theater.runScript(function*() {
                    yield;
                    global.theater.playCutscene(ARG.Cutscenes.BEGIN_ARG_2);
                });
            } else if (DAILY) {
                yield S.fadeOut(1, 0x000000);
                yield S.wait(1);

                global.game.loadMainMenu();
                global.game.startGame(() => DailyScreen.STAGE());
            } else {
                yield S.fadeOut(1, 0x000000);
                yield S.wait(1);

                global.game.loadMainMenu();
            }
        }
    }

    export const WIN: Cutscene = {
        script: function*() {
            if (youArePlaying(global.world)) {
                GAME_DATA.roundResults[GAME_DATA.round] = 'win';

                GAME_DATA.round++;
                if (!vsOpponentHadDoveBallInSquadLastRound()) {
                    GAME_DATA.wins++;
                }
            }
            saveEndOfRoundGameData('win');

            let timeScale = getBattleTransitionTimeScale();

            if (youArePlaying(global.world)) {
                updateWinRoundAchievements();
                updatePlayRoundAchievements();
            }

            Persist.persist();

            yield EndScreens.showWin();

            yield S.wait(4*timeScale);

            if (GAME_MODE === 'spectate') {
                // Safety
                global.theater.loadStage(SpectateWaitingRoom.STAGE, transition());
            } else {
                global.theater.loadStage(Stages.PREP, transition());
            }
        }
    }

    export const LOSE: Cutscene = {
        script: function*() {
            if (youArePlaying(global.world)) {
                GAME_DATA.roundResults[GAME_DATA.round] = 'loss';
                GAME_DATA.hasLostRound = true;

                GAME_DATA.round++;
                if (!hasDoveBallInSquad()) {
                    GAME_DATA.health--;
                }
            }
            saveEndOfRoundGameData('loss');

            let timeScale = getBattleTransitionTimeScale();

            if (youArePlaying(global.world)) {
                updatePlayRoundAchievements();
            }

            Persist.persist();

            yield EndScreens.showLose();

            yield S.wait(4*timeScale);

            if (GAME_MODE === 'spectate') {
                // Safety
                global.theater.loadStage(SpectateWaitingRoom.STAGE, transition());
            } else {
                global.theater.loadStage(Stages.PREP, transition());
            }
        }
    }

    export function DRAW(type: 'normal' | 'timeout'): Cutscene {
        return {
            script: function*() {
                if (youArePlaying(global.world)) {
                    GAME_DATA.roundResults[GAME_DATA.round] = 'draw';

                    GAME_DATA.round++;
                }
                saveEndOfRoundGameData('draw');

                let timeScale = getBattleTransitionTimeScale();

                if (youArePlaying(global.world)) {
                    updatePlayRoundAchievements();

                    if (type === 'timeout') {
                        updateAchievementProgress('TimeOut', p => p+1);
                    }

                    updateAchievementProgress('DrawsInARow', p => Math.max(p, getLastDrawStreak()));
                }

                Persist.persist();

                yield EndScreens.showDraw(type);

                yield S.wait(4*timeScale);

                if (GAME_MODE === 'spectate') {
                    // Safety
                    global.theater.loadStage(SpectateWaitingRoom.STAGE, transition());
                } else {
                    global.theater.loadStage(Stages.PREP, transition());
                }
            }
        }
    }

    export function SPECTATE_RESULT(winner: string, drawType: 'normal' | 'timeout'): Cutscene {
        return {
            script: function*() {
                GAME_DATA.round++;

                let timeScale = getBattleTransitionTimeScale();

                yield EndScreens.showSpectateNonDraw(winner, drawType);

                yield S.wait(4*timeScale);

                global.theater.loadStage(SpectateWaitingRoom.STAGE, transition());
            }
        }
    }

    function slowWorldAndFade(): Script.Function {
        return function*() {
            let timeScale = getBattleTransitionTimeScale();

            if (!global.world.select.name('fadescreen', false)) {
                let bsc = global.theater.select.type(BattleSpeedController);
                bsc.enabled = false;
                bsc.endOfGame = true;
                global.game.stopMusic(2);
                global.world.select.typeAll(Ball).forEach(ball => ball.showAllStats());
                yield S.tween(2, global.world, 'timeScale', 1, 0, Tween.Easing.OutQuad);
                yield S.wait(1*timeScale);

                global.game.allowPauseWithPauseKey = false;

                let screen = global.world.addWorldObject(new Sprite({
                    name: 'fadescreen',
                    texture: Texture.filledRect(global.gameWidth, global.gameHeight, 0x000000, 0.8),
                    alpha: 0,
                    ignoreCamera: true,
                }));
    
                yield S.doOverTime(1*timeScale, t => screen.alpha = t);
            }
        }
    }

    function submitHostRoundResult(roundResult: 'win' | 'loss' | 'draw') {
        return function*() {
            let timeScale = getBattleTransitionTimeScale();

            let waitingForText = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 136,
                text: `Submitting round results...`,
                anchor: Vector2.TOP_CENTER,
                alpha: 0,
            }));

            let waitingForSpinner = global.world.addWorldObject(new Spinner(global.world.width/2, 100, 4, 16));
            waitingForSpinner.useGlobalTime = true;
            waitingForSpinner.alpha = 0;

            yield S.doOverTime(1*timeScale, t => {
                waitingForText.alpha = t;
                waitingForSpinner.alpha = t;
            });

            let errorText = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 178,
                anchor: Vector2.CENTER,
                style: { color: 0x888888 },
            }));

            let hostProtected = hasDoveBallInSquad();
            let nonhostProtected = !!VS_GAME.enemysquad.balls.find(ball => ball.properties.type === 127);

            while (true) {
                let err: string;
                let callDone = false;
                API.submitvsgameresult((_: undefined, _err: string) => {
                    err = _err;
                    callDone = true;
                    if (!err) debug('Submitted VS squad:', GAME_DATA.squad);
                }, GAME_DATA.gameId, GAME_DATA.squad.name, GAME_DATA.round, roundResult, hostProtected, nonhostProtected, Persistence.getProfileId());

                let startTime = Date.now();
                yield S.waitUntil(() => callDone || Date.now() - startTime > 5000);
                if (!callDone) {
                    err = ERROR_TIMED_OUT;
                }

                if (err) {
                    console.error("Error:", err);
                    errorText.setText('An error occurred');
                    yield S.wait(2);
                    continue;
                }

                errorText.setText('');
                break;
            }

            let result: { game?: API.VSGame } = {};
            yield GameFragments.waitForVSGameCondition(GAME_DATA.gameId, GAME_DATA.squad.name, false, game => game, result, err => errorText.setText(err ? 'An error occurred' : ''));
            VS_GAME = result.game;

            yield S.doOverTime(1*timeScale, t => {
                waitingForText.alpha = 1-t;
                waitingForSpinner.alpha = 1-t;
            });
            waitingForText.kill();
            waitingForSpinner.kill();
        }
    }

    function waitForVSHostRoundResult(roundResult: { roundResult?: 'win' | 'loss' | 'draw' }) {
        return function*() {
            let timeScale = getBattleTransitionTimeScale();

            let waitingForText = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 136,
                text: `Waiting for round results...`,
                anchor: Vector2.TOP_CENTER,
                alpha: 0,
            }));

            let waitingForSpinner = global.world.addWorldObject(new Spinner(global.world.width/2, 100, 4, 16));
            waitingForSpinner.useGlobalTime = true;
            waitingForSpinner.alpha = 0;

            yield S.doOverTime(1*timeScale, t => {
                waitingForText.alpha = t;
                waitingForSpinner.alpha = t;
            });

            let errorText = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 178,
                anchor: Vector2.CENTER,
                style: { color: 0x888888 },
            }));

            let result: { game?: API.VSGame } = {};
            yield GameFragments.waitForVSGameCondition(GAME_DATA.gameId, GAME_DATA.squad.name, false, game => game.round > GAME_DATA.round || !game.yoursquad || !game.enemysquad, result, err => errorText.setText(err ? 'An error occurred' : ''));

            VS_GAME = result.game;
            roundResult.roundResult = VS_GAME.lastroundresult;

            yield S.doOverTime(1*timeScale, t => {
                waitingForText.alpha = 1-t;
                waitingForSpinner.alpha = 1-t;
            });
            waitingForText.kill();
            waitingForSpinner.kill();
        }
    }

    function showRoundResultError() {
        return function*() {
            let timeScale = getBattleTransitionTimeScale();

            let errorText = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: global.gameHeight/2,
                text: `An error occurred...\n\nResults do not match\nthe host's!`,
                anchor: Vector2.CENTER,
                justify: 'center',
                alpha: 0,
            }));

            yield S.tween(1*timeScale, errorText, 'alpha', 0, 1);
            yield S.wait(2*timeScale);
            yield S.tween(1*timeScale, errorText, 'alpha', 1, 0);

            errorText.kill();
        }
    }

    function transition() {
        return new Transitions.Curtains({ inTime: 0.5, midTime: 1, outTime: 0.5 });
    }

    function updateWinRoundAchievements() {
        if (global.world.select.typeAll(Ball).filter(ball => ball.team === 'friend').length >= 5) {
            updateAchievementProgress('FiveRemainingBalls', p => 1);
        }

        updateAchievementProgress('RoundsInARow', p => Math.max(p, getLastWinStreak()));

        updateAchievementProgress('WinFiftyRounds', p => p+1);

        if (ENEMY_SQUAD_DATA) {
            let enemyName = ENEMY_SQUAD_DATA.squad.name.trim();
            if (ENEMY_SQUAD_DATA.gameResult === 'win') {
                updateAchievementProgress('DefeatCrownedSquads', p => p+1);
            }

            if (enemyName === 'lectvs') {
                updateAchievementProgress('DefeatLectvs', p => p+1);
            }

            if (enemyName === 'Materwelons') {
                updateAchievementProgress('DefeatMaterwelons', p => p+1);
            }

            if (enemyName === 'Xephia' || enemyName === 'Mobile Xephia' || enemyName === 'App Xephia') {
                updateAchievementProgress('DefeatXephia', p => p+1);
            }
        }

        let ballTypeCounts: DictNumber<number> = {};
        for (let ball of GAME_DATA.squad.balls) {
            if (!(ball.properties.type in ballTypeCounts)) ballTypeCounts[ball.properties.type] = 0;
            ballTypeCounts[ball.properties.type]++;
        }
        if (Object.keys(ballTypeCounts).some(k => ballTypeCounts[k] >= 3)) {
            updateAchievementProgress('SameBall', p => p+1);
        }

        let startingFriendBalls = global.world.data.startingFriendBalls;
        if (_.isArray(startingFriendBalls) && startingFriendBalls.every(ball => ball instanceof Ball && ball.alive && !ball.dead && ball.world)) {
            updateAchievementProgress('NoBallsDied', p => p+1);
        }

        let battleTimer = global.world.select.type(BattleTimer, false);
        if (battleTimer && battleTimer.battleTime <= 3) {
            updateAchievementProgress('WinFast', p => p+1);
        }

        if (ENEMY_SQUAD_DATA && _.includes(GAME_DATA.playersWhoBeatYou, ENEMY_SQUAD_DATA.squad.name) && GAME_MODE === 'mm') {
            updateAchievementProgress('GetRevenge', p => p+1);
        }
    }

    function updatePlayRoundAchievements() {
        updateAchievementProgress('PlayHundredRounds', p => p+1);
    }

    function updateAlmanacEntriesForWin() {
        for (let ball of GAME_DATA.squad.balls) {
            addAlmanacBallWin(ball.properties.type);

            if (ball.properties.type === 2) {
                addAlmanacBallWin(3);  // Splitter Spawn
            }

            if (ball.properties.type === 15 || ball.properties.type === 19) {
                addAlmanacBallWin(16);  // Skeleton
            }

            if (ball.properties.type === 53) {
                addAlmanacBallWin(54);  // Cannonball
            }

            if (ball.properties.equipment >= 0) {
                addAlmanacItemWin(getItemTypeForEquipmentType(ball.properties.equipment));
            }
        }

        for (let ballType of GAME_DATA.ballTypesForAlmanacWin) {
            addAlmanacBallWin(ballType);
        }

        for (let itemType of GAME_DATA.itemTypesForAlmanacWin) {
            addAlmanacItemWin(itemType);
        }
    }

    

    

    function saveEndOfRoundGameData(roundResult: 'win' | 'loss' | 'draw') {
        if (GAME_MODE === 'mm') {
            saveMatchmakingOrChallengeModeOrDailyGameData({
                gameData: GAME_DATA,
                state: 'result',
                roundResult: roundResult,
                lock: gameDataLock(),
            }, CHALLENGE_MODE_ENABLED, DAILY);
        }

        if (GAME_MODE === 'vs') {
            saveVersusModeGameData({
                gameData: GAME_DATA,
                state: 'result',
            });
        }
    }

    function getDelayResolveObjects(world: World) {
        return _.flatten(['friend', 'enemy', 'neutral'].map((team: Ball.Team) => world.select.tag(Tags.DELAY_RESOLVE(team))));
    }

    function getDelayResolveObjectTeam(dro: WorldObject): Ball.Team {
        if (!dro) return undefined;
        for (let tag of dro.tags) {
            for (let team of ['friend', 'enemy', 'neutral']) {
                if (tag === Tags.DELAY_RESOLVE(team as Ball.Team)) {
                    return team as Ball.Team;
                }
            }
        }
        return undefined;
    }
}