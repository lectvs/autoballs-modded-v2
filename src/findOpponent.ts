var TIP_NUM = 0;
const TIPS = [
    `(Everything that happens in battle resets on the next round!)`,
    `(Every few turns, the shop upgrades to sell better balls!)`,
    `(Combining Coins will combine their gold stores!)`,
    `(Don't forget to freeze!)`,
    `(If you win 8 rounds, your name gets a [color 0xD3B000][offsetx -3]<crown>[/o][/c]Crown!)`,
];


var ERROR_TIMED_OUT = 'Timed out';

function findOpponent(world: World, predefinedEnemySquad?: API.SquadData, isPredefinedEnemySquadBot?: boolean) {
    return function*() {
        global.game.allowPauseWithPauseKey = false;

        world.select.modules(Button).forEach(button => button.enabled = false);
        world.select.type(BallMover).removeFromWorld();
        world.select.type(BallFreezer).removeFromWorld();
        world.select.type(BallHighlighter).enabled = false;
        world.select.type(InfoBox).enabled = false;
        world.select.type(BoundsInfoBox).enabled = false;

        yield waitUntilFindOpponentDelayComplete(world);

        setBallPositions(world);

        // After all changes to the squad have been finalized...

        saveMatchmakingOrChallengeModeOrDailyGameData({
            gameData: GAME_DATA,
            state: 'play',
            lock: gameDataLock(),
        }, CHALLENGE_MODE_ENABLED, DAILY);

        let fade = world.addWorldObject(new Sprite({
            texture: Texture.filledRect(world.width, world.height, 0x000000, 0.8),
            alpha: 0,
        }));

        let findOpponentText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 136,
            text: predefinedEnemySquad ? 'Starting battle...' : 'Finding an opponent...',
            anchor: Vector2.TOP_CENTER,
            alpha: 0,
        }));

        let findOpponentSpinner = world.addWorldObject(new Spinner(world.width/2, 100, 4, 16));
        findOpponentSpinner.alpha = 0;

        yield S.doOverTime(1, t => {
            fade.alpha = t;
            findOpponentText.alpha = t;
            findOpponentSpinner.alpha = t;
            if (global.game.musicManager.currentMusic) {
                global.game.musicManager.currentMusic.volume = 1-0.5*t;
            }
        });

        let tipText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: global.gameHeight-8,
            text: TIPS[TIP_NUM],
            maxWidth: global.gameWidth-40,
            anchor: Vector2.BOTTOM_CENTER,
            justify: 'center',
            style: { color: 0xAAAAAA },
            alpha: 0,
        }));
        yield S.tween(1, tipText, 'alpha', 0, 1);

        TIP_NUM = M.mod(TIP_NUM+1, TIPS.length);

        let arenaName = world.data.arenaName;
        let apiVersionForSubmit = getApiVersionForSquadSubmit(GAME_DATA);
        let dailyDay = DAILY ? DAILY.day : undefined;
        let week = GAME_DATA.weekly ? GAME_DATA.weekly.week : undefined;

        

        let bannedBallTypes = [41];
        if (!hasCompletedAchievement('ArgPart1')) bannedBallTypes.push(42);

        let packsForOpponent = GAME_DATA.packs;
        if (isModifierActive('packclash') && packsForOpponent.length === 1) {
            if (packsForOpponent[0] === 'weekly') packsForOpponent = ['weekly'];
            else if (packsForOpponent[0] === 'classic') packsForOpponent = ['community'];
            else packsForOpponent = ['classic'];
        }

        let enemySquadData: API.SquadData;
        let startTime = Date.now();
        let err: string;
        let isBot = false;

        if (predefinedEnemySquad) {
            enemySquadData = predefinedEnemySquad;
            isBot = !!isPredefinedEnemySquadBot;
        } else if (DAILY && GAME_DATA.round-1 < DAILY.squads.length && DAILY.squads[GAME_DATA.round-1]) {
            enemySquadData = O.deepClone(DAILY.squads[GAME_DATA.round-1]);
            transformDailyEnemySquad(enemySquadData);
        } else {
            let retriesLeft = 5;
    
            let getArenaName = _.contains(Arenas.ARENAS, arenaName) ? arenaName : Arenas.ARENA_FIRST;
    
            while (retriesLeft >= 0) {
                let callDone = false;
                API.getsquad((squadData: API.SquadData, e: string) => {
                    enemySquadData = squadData;
                    err = e;
                    callDone = true;
                    debug('Received squad data:', squadData);
                }, GAME_DATA.squad.name, GAME_DATA.round, getAllowProfaneSquadNames(), bannedBallTypes,
                    GAME_DATA.lap, getArenaName, packsForOpponent, week);
        
                startTime = Date.now();
                yield S.waitUntil(() => callDone || Date.now() - startTime > 5000);
                if (!callDone) {
                    err = ERROR_TIMED_OUT;
                }
    
                if (err) {
                    console.error('Error fetching squad:', err);
                }
    
                if (err && retriesLeft > 0) {
                    retriesLeft--;
                    yield S.wait(3);
                    continue;
                }
    
                break;
            }
    
            if (err) {
                console.error('Failed to get squad:', err);
                enemySquadData = {
                    squad: generateBotSquadForRound(GAME_DATA.round, packsForOpponent, GAME_DATA.weekly),
                    version: API.VERSION,
                    arena: GAME_DATA.arena,
                };
                isBot = true;
                if (err === API.ERROR_NO_SQUAD_RECEIVED) {
                    GAME_DATA.offlineCount++;
                }
            }
        }

        // :)
        let totalTime = Random.int(1000, 3000);
        yield S.waitUntil(() => Date.now() - startTime > totalTime);

        cleanseEnemySquadData(enemySquadData);
        ENEMY_SQUAD_DATA = enemySquadData;

        if (ENEMY_SQUAD_DATA.arena !== GAME_DATA.arena && !predefinedEnemySquad) {
            for (let ball of ENEMY_SQUAD_DATA.squad.balls) {
                let pos = vec2(ball);
                let translatedPos = Arenas.translateCoordinate(pos, ENEMY_SQUAD_DATA.arena, GAME_DATA.arena);
                ball.x = translatedPos.x;
                ball.y = translatedPos.y;
            }
        }

        saveMatchmakingOrChallengeModeOrDailyGameData({
            gameData: GAME_DATA,
            state: 'battle',
            enemySquadData: ENEMY_SQUAD_DATA,
            isEnemySquadBot: isBot,
            lock: gameDataLock(),
        }, CHALLENGE_MODE_ENABLED, DAILY);

        let formattedEnemyName = enemySquadData.squad.name;
        if (enemySquadData.gameResult === 'win') {
            formattedEnemyName = crownedName(enemySquadData.squad.name);
        }

        world.select.name<SpriteText>('opponentname').setText(formattedEnemyName);

        world.select.name('midwall')?.removeFromWorld();

        for (let i = 0; i < enemySquadData.squad.balls.length; i++) {
            let ball = world.addWorldObject(squadBallToWorldBall(enemySquadData.squad.balls[i], undefined, -1, 'enemy', true));
            if (isBot) {
                ball.hp = ball.maxhp = ball.properties.health-1 + ball.getShopHp();
                ball.dmg = ball.properties.damage-1 + ball.getShopDmg();
            }
            ball.showAllStats();
        }

        let balls = world.select.typeAll(Ball).filter(ball => !ball.isInShop);
        for (let ball of balls) {
            ball.onTeamsSpawned();
        }

        global.game.stopMusic(1);

        yield S.doOverTime(0.5, t => {
            findOpponentText.alpha = 1-t;
            findOpponentSpinner.alpha = 1-t;
            tipText.alpha = 1-t;
        });
        findOpponentText.kill();
        findOpponentSpinner.kill();
        tipText.kill();

        let foundOpponentTextTop = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 120,
            text: err ? 'Could not find opponent.' : `You are battling [y]${formattedEnemyName}[/y]!`,
            anchor: Vector2.CENTER,
            alpha: 0,
        }));
        let foundOpponentTextBottom = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 140,
            text: err ? 'Auto-generating one instead!' : `(Good luck! :D)`,
            anchor: Vector2.CENTER,
            alpha: 0,
        }));

        yield S.doOverTime(0.5, t => {
            foundOpponentTextTop.alpha = t;
            foundOpponentTextBottom.alpha = t;
        });

        yield S.wait(1);

        yield S.doOverTime(0.5, t => {
            fade.alpha = 1-t;
            foundOpponentTextTop.alpha = 1-t;
            foundOpponentTextBottom.alpha = 1-t;
        });
        fade.kill();
        foundOpponentTextTop.kill();
        foundOpponentTextBottom.kill();

        let gear = global.world.select.name<Sprite>('gear');
        gear.getModule(Button).enabled = true;

        let pauseChar = IS_MOBILE ? '[offset 5 -3]<touch_tap>[/]' : '<lmb>';
        let speedUpChar = IS_MOBILE ? '[offset 5 -3]<touch_hold>[/]' : '<rmb>';
        let timeControlText = world.addWorldObject(new SpriteText({
            x: world.width/2, y: 232,
            text: `${pauseChar} Pause    ${speedUpChar} Speed Up`,
            anchor: Vector2.CENTER,
            alpha: 0,
            effects: { outline: { color: 0x000000, alpha: 0 }},
            layer: Battle.Layers.ui,
        }));

        let sidePanel = world.select.name('sidepanel');
        yield [
            S.tween(1, sidePanel, 'x', 0, world.width, Tween.Easing.InOutQuad),
            S.doOverTime(1, t => {
                timeControlText.alpha = t;
                timeControlText.effects.outline.alpha = t;
            }),
        ];
        sidePanel.kill();

        world.select.type(BallHighlighter).enabled = true;
        world.select.type(InfoBox).enabled = true;

        world.data.youArePlaying = true;

        global.theater.select.type(BattleSpeedController).enabled = true;

        yield GameFragments.gameCountdownAndStartScript(world);
    }
}

function getBattleState(world: World): string {
    if (!world) return undefined;
    return world.data.battleState;
}

function youArePlaying(world: World): boolean {
    return world && !!world.data.youArePlaying;
}

function cleanseEnemySquadData(enemySquadData: API.SquadData) {
    if (GAME_DATA.lap <= 1) return;
    if (enemySquadData.version === API.VERSION) return;

    /* Re-enable if VL stat skewing is needed */
    
    // let yourTotalStats = A.sum(GAME_DATA.squad.balls, ball => ball.properties.damage + ball.properties.health);
    // let enemyTotalStats = A.sum(enemySquadData.squad.balls, ball => ball.properties.damage + ball.properties.health);

    // if (enemyTotalStats > yourTotalStats) {
    //     for (let ball of enemySquadData.squad.balls) {
    //         ball.properties.health = Math.ceil(ball.properties.health * yourTotalStats/enemyTotalStats);
    //         ball.properties.damage = Math.ceil(ball.properties.damage * yourTotalStats/enemyTotalStats);
    //     }
    // }

    // let yourTotalLevel = A.sum(GAME_DATA.squad.balls, ball => ball.properties.level);
    // let enemyTotalLevel = A.sum(enemySquadData.squad.balls, ball => ball.properties.level);

    // if (enemyTotalLevel > yourTotalLevel) {
    //     for (let ball of enemySquadData.squad.balls) {
    //         ball.properties.level = Math.ceil(ball.properties.level * yourTotalLevel/enemyTotalLevel);
    //     }
    // }
}

function transformDailyEnemySquad(enemySquadData: API.SquadData) {
    Random.seed(`dailyadjustments_${getRandomSeed(GAME_DATA.gameId, DAILY)}_${GAME_DATA.round}`);
    for (let ball of enemySquadData.squad.balls) {
        adjustSquadBallForModifiers(ball);
    }
}