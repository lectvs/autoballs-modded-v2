namespace GameFragments {
    export function startMatchmakingGame(gameData: MatchmakingGameData, challengeMode: boolean, daily: API.Daily) {
        GAME_DATA = gameData.gameData;
        fixGameDataFromPreviousVersion(GAME_DATA);
        CHALLENGE_MODE_ENABLED = challengeMode;
        DAILY = daily;

        SaveValidator.storeLastCloudLockSessionId();

        if (gameData.state === 'startshop') {
            global.theater.loadStage(Stages.PREP, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
            return;
        }

        if (gameData.state === 'midshop') {
            global.theater.loadStage(Stages.PREP_SKIP_PRE_SHOP_EFFECTS, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
            return;
        }

        if (gameData.state === 'play') {
            global.theater.loadStage(Stages.PREP_SKIP_PRE_SHOP_EFFECTS, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }), world => {
                world.runScript(findOpponent(world));
            });
            return;
        }

        if (gameData.state === 'battle') {
            global.theater.loadStage(Stages.PREP_SKIP_PRE_SHOP_EFFECTS, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }), world => {
                world.runScript(findOpponent(world, gameData.enemySquadData, gameData.isEnemySquadBot));
            });
            return;
        }

        if (gameData.state === 'result') {
            if (GAME_DATA.wins >= GET_MAX_WINS()) {
                global.theater.playCutscene(RoundResults.VICTORY);
                return;
            }

            if (GAME_DATA.health <= 0) {
                global.theater.playCutscene(RoundResults.GAMEOVER);
                return;
            }

            global.theater.loadStage(Stages.PREP, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
            return;
        }

        console.error('Unknown game state, defaulting to shop:', gameData.state);
        global.theater.loadStage(Stages.PREP, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
    }

    export function startVsGame(gameid: string, game: API.VSGame, newGame: boolean, spectate: boolean) {
        if (spectate) GAME_MODE = 'spectate';

        CHALLENGE_MODE_ENABLED = false;
        DAILY = undefined;

        VS_GAME = game;
        Input.preventRegularKeyboardInput = false;

        let savedGameData = loadVersusModeGameData({ type: 'current', gameid });
        if (savedGameData && !spectate) {
            GAME_DATA = savedGameData.gameData;
            fixGameDataFromPreviousVersion(GAME_DATA);
        } else {
            if (newGame) GAME_DATA = newGameData();
            GAME_DATA.squad.name = VS_GAME.yourname;
        }

        GAME_DATA.gameId = gameid;

        GAME_DATA.availableBallTypes = VS_GAME.allowedBallTypes;
        GAME_DATA.availableItemTypes = VS_GAME.allowedItemTypes;

        GAME_DATA.arena = game.arena;
        GAME_DATA.packs = game.yourpacks as Pack[];
        GAME_DATA.weekly = game.weekly;

        if (game.yourhealth === 0) {
            GAME_DATA.round = VS_GAME.round;
            GAME_DATA.health = VS_GAME.yourhealth;
            GAME_DATA.wins = 8 - VS_GAME.enemyhealth;
            global.theater.playCutscene(RoundResults.GAMEOVER);
            return;
        }

        if (game.enemyhealth === 0) {
            GAME_DATA.round = VS_GAME.round;
            GAME_DATA.health = VS_GAME.yourhealth;
            GAME_DATA.wins = 8 - VS_GAME.enemyhealth;
            global.theater.playCutscene(RoundResults.VICTORY);
            return;
        }

        if (game.yoursquad && game.enemysquad) {
            GAME_DATA.squad = game.yoursquad;
            GAME_DATA.round = VS_GAME.round;
            GAME_DATA.health = VS_GAME.yourhealth;
            GAME_DATA.wins = 8 - VS_GAME.enemyhealth;

            if (!spectate) {
                saveVersusModeGameData({
                    gameData: GAME_DATA,
                    state: 'battle',
                });
            }

            global.theater.loadStage(() => CustomBattle.STAGE(game.yoursquad, game.enemysquad, GAME_DATA.gameId, VS_GAME.round), new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
            return;
        }

        if (spectate) {
            GAME_DATA.round = VS_GAME.round;
            global.theater.loadStage(SpectateWaitingRoom.STAGE, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
            return;
        }

        if (game.yoursquad) {
            GAME_DATA.squad = game.yoursquad;
            GAME_DATA.gold = 0;

            global.theater.loadStage(Stages.PREP_SKIP_PRE_SHOP_EFFECTS, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }), world => {
                world.runScript(findOpponentVs(world, true));
            });
            return;
        }

        if (game.yourlastsquad && !savedGameData) {
            GAME_DATA.squad = game.yourlastsquad;
        }

        if (savedGameData && savedGameData.state === 'midshop') {
            global.theater.loadStage(Stages.PREP_SKIP_PRE_SHOP_EFFECTS, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
            return;
        }
        
        global.theater.loadStage(Stages.PREP, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
    }

    export function playPrep(world: World) {
        if (world.data.clickedPlay) return;
        
        world.playSound('play');
        world.data.clickedPlay = true;

        let timeLimitTimer = world.select.name('timelimittimer', false);
        if (timeLimitTimer) {
            timeLimitTimer.getTimers()[0].paused = true;
        }

        FIND_OPPONENT_WAIT_TIME = 0;
    
        let playerBalls = world.select.typeAll(Ball).filter(ball => !ball.isInShop);
        for (let ball of playerBalls) {
            ball.playButtonClicked();
        }

        setDataPlay();
    
        if (GAME_MODE === 'vs') {
            world.runScript(findOpponentVs(world));
        } else {
            world.runScript(findOpponent(world));
        }
    }

    export function gameCountdownAndStartScript(world: World) {
        return function*() {
            yield S.wait(0.5);

            seedBattle(GAME_DATA.gameId, GAME_DATA.round, DAILY);
            world.data.battleState = Ball.States.PRE_BATTLE;

            for (let ball of world.select.typeAll(Ball)) {
                ball.setState(Ball.States.PRE_BATTLE);
            }

            function* doCountdownNumber(count: number) {
                let cd = world.addWorldObject(new Sprite({
                    x: global.gameWidth/2, y: global.gameHeight/2,
                    texture: `countdown/${count}`,
                    life: 0.5,
                    update: function() {
                        this.alpha = 1 - Tween.Easing.InQuad(this.life.progress);
                        if (count === 0 && Random.boolean(30 * this.delta)) this.tint = 0xFFFFFF - this.tint;
                    }
                }));
                
                yield S.waitUntil(() => !cd.world);
            }

            for (let count = 3; count >= 1; count--) {
                yield S.wait(0.5);
                global.world.playSound('countdown', { humanized: false });
                yield* doCountdownNumber(count);
            }

            yield S.wait(0.2);

            world.addWorldObject(new BallLimiter());

            let abilitySystem = world.select.type(AbilitySystem);
            abilitySystem.reset();

            for (let ball of world.select.typeAll(Ball)) {
                ball.queueAbilities('onPreBattle');
            }

            abilitySystem.consistentizeQueuedAbilities();

            let activatedAnyPreBattleAbility = false;
            let activatedCatchAllAbilities = false;
            while (abilitySystem.hasManualAbilitiesQueued()) {
                let abilities = abilitySystem.activateNextManualAbilities();
                if (_.isEmpty(abilities)) break;

                activatedAnyPreBattleAbility = true;

                let initialWaitTime = M.max(abilities, ability => ability.source.preBattleAbilityInitialWaitTime);
                let allWaitConditionScripts = abilities.map(ability => S.waitUntil(() => !ability.source.isPreBattleAbilityActive));

                yield S.wait(initialWaitTime);
                yield S.either(S.wait(8), S.simul(...allWaitConditionScripts));
                yield S.wait(0.2);

                abilitySystem.purgeDeadPreBattleAbilities();
            }

            if (activatedCatchAllAbilities) {
                yield S.wait(1);
            }

            if (activatedAnyPreBattleAbility) {
                yield S.wait(1);
            }

            yield S.wait(0.3);

            global.world.runScript(function*() {
                for (let i = 0; i < 5; i++) {
                    global.world.playSound('countdownfight', { humanized: false });
                    yield S.wait(0.1);
                }
            });
            global.game.playMusic(pickMusicForThisRoundBattle(GAME_DATA), 1);
            yield* doCountdownNumber(0);

            world.data.startEarlyTime = world.select.typeAll(Ball).filter(ball => ball.team === 'friend' && !ball.isInShop);

            world.data.battleState = Ball.States.BATTLE;

            let balls = world.select.typeAll(Ball);
            let startEarlyBalls = balls.filter(ball => ball.getStartEarlyTime() > 0);
            let maxStartEarlyTime = _.isEmpty(startEarlyBalls) ? 0 : M.max(startEarlyBalls, ball => ball.getStartEarlyTime());

            for (let ball of balls) {
                let waitTime = maxStartEarlyTime - ball.getStartEarlyTime();
                if (waitTime > 0) {
                    ball.doAfterTime(waitTime, () => {
                        ball.setState(Ball.States.BATTLE);
                        ball.enterBattle();
                    });
                } else {
                    ball.setState(Ball.States.BATTLE);
                    ball.enterBattle();
                }
            }

            yield S.wait(maxStartEarlyTime);
    
            world.select.type(InfoBox).disableWhenGameIsRunning = true;
    
            world.addWorldObject(new BattleTimer());
            world.runScript(RoundResults.RESULT_CHECK());
    
            global.game.allowPauseWithPauseKey = true;

            if (world.data.onBattleStart) world.data.onBattleStart();
        }
    }

    function seedBattle(gameid: string, round: number, daily: API.Daily) {
        let seed = getRandomSeed(gameid, daily)
        Random.seed(`battle_${seed}_${round}`);
        Ball.Random.seed(`battle_ball_${seed}_${round}`);
        debug('seeded', `battle_ball_${seed}_${round}`);
    }

    export function waitForVSGameCondition(gameid: string, squadName: string, spectate: boolean, condition: (game: API.VSGame) => any, returnObject: { game?: API.VSGame }, onError: (err: string) => void) {
        return function*() {
            let game: API.VSGame;
            while (!game || !condition(game)) {
                let err = undefined;
                let callDone = false;
                API.getvsgame((_game: API.VSGame, e: string) => {
                    game = _game;
                    err = e;
                    callDone = true;
                }, gameid, squadName, spectate, true, Persistence.getProfileId());
        
                let startTime = Date.now();
        
                yield S.waitUntil(() => callDone || Date.now() - startTime > 5000);
                if (!callDone) {
                    err = ERROR_TIMED_OUT;
                }

                if (err) {
                    console.error('Failed to get game state:', err);
                    onError(err);
                    yield S.wait(2);
                    continue;
                }

                debug('Got VS game:', game);
                if (onError) onError(undefined);

                if (!game || !condition(game)) {
                    yield S.wait(2);
                }
            }

            if (returnObject) {
                returnObject.game = game;
            }
        }
    }
}