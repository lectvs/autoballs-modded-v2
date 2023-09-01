namespace EndScreens {
    const VICTORY_MESSAGES = [
        `I'm so proud of you :')`,
        `Great job!!!`,
        `Nice balls!!`,
        `You are the AUTO BALL!`,
    ];

    const GAMEOVER_MESSAGES = [
        `We'll just have to do\nbetter next time!`,
        `...But I bet the next game\nwill be a win for sure! :)`,
        `Tough competition today!`,
    ];

    const WIN_MESSAGES = [
        `You can do it! :)`,
        `Keep on going!`,
        `Let's go!!!`,
    ];

    const LOSE_MESSAGES = [
        `Come back stronger!`,
        `Don't give up!\nYou can do this! :)`,
        `You're not out yet!\nStay in there! :)`,
        `But you can still come back!`,
    ];

    const DRAW_MESSAGES = [
        `You're still in there...!`,
        `At least it's not a\nloss, right?`,
        `That was a close one!`,
    ];

    const SPECTATE_MESSAGES = [
        `The battle continues!`,
        `Who will come out on top?`,
    ];

    const VS_DEFEATED_VERBS = [
        `DEFEATED`, `CRUSHED`, `OBLITERATED`, `DEMOLISHED`, `DUNKED ON`, `CLAPPED`, `OUTPLAYED`,
    ];

    function getVictoryMessageForBalls(balls: number) {
        let message = Random.element(VICTORY_MESSAGES);
        if (message === VICTORY_MESSAGES[2] && balls === 1) {
            return 'Nice ball!!';
        }
        return message;
    }

    export function showVictory(priorLap: number, priorWins: number, priorHealth: number, priorRound: number, result: { continueSelection?: 'continue' | 'victorylap' }) {
        return function*() {
            let timeScale = getBattleTransitionTimeScale();

            let totalWins = priorWins+1 + (priorLap-1)*8;
            let totalMaxWins = GET_MAX_WINS() + (priorLap-1)*8;
            let winsText = priorLap === 1 ? `${totalWins}/${totalMaxWins}` : `[gold]${totalWins}/${totalMaxWins}[/gold]`;
            let wins = global.world.addWorldObject(new SpriteText({
                name: 'wintext',
                x: global.gameWidth/2, y: 42,
                text: `[gold]<trophy>[/gold] ${winsText}   [r]<heart>[/r] ${priorHealth}   [rb]R[/rb] ${priorRound}   <clock> ${secondsToFormattedTime(GAME_DATA.gameTime)}`,
                style: { color: 0xFFFFFF },
                anchor: Vector2.CENTER,
                alpha: 0,
            }));
            yield S.tween(2*timeScale, wins, 'alpha', 0, 1);
            yield S.wait(1*timeScale);

            if (!isEscape()) global.theater.playSound('win');

            let youwin = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 76,
                text: escapeGarble(`VICTORY!!!`),
                scale: 2,
                style: { color: isEscape() ? 0xDDDDDD : (isBotted() && GAME_DATA.lap >= 7 ? 0xFFD800 : 0x00FF00) },
                anchor: Vector2.CENTER,
                alpha: 0,
            }));
            yield S.tween(1*timeScale, youwin, 'alpha', 0, 1);
            yield S.wait(1*timeScale);

            yield showYourSquad(100, true, timeScale, priorLap);
            yield S.wait(1*timeScale);

            let message = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 166,
                text: escapeGarble(getVictoryMessageForBalls(GAME_DATA.squad.balls.length)),
                style: { color: 0xFFFFFF },
                justify: 'center',
                anchor: Vector2.TOP,
                alpha: 0,
            }));
            World.Actions.orderWorldObjectBefore(message, global.world.select.type(YourTeamWorld));
            yield S.tween(1*timeScale, message, 'alpha', 0, 1);
            yield S.wait(2*timeScale);

            if (isBotted()) {
                global.world.addWorldObject(new Sprite({
                    texture: Texture.filledRect(Math.min(GAME_DATA.offlineCount, global.gameWidth), 1, 0x111111),
                }));
            }

            let shareText = global.world.addWorldObject(new SpriteText({
                name: 'sharetext',
                x: global.gameWidth/2 - 52, y: 202,
                text: 'SHARE :)',
                anchor: Vector2.CENTER_LEFT,
                font: 'smallnumbers',
                alpha: 0,
            }));
            World.Actions.orderWorldObjectBefore(shareText, global.world.select.type(YourTeamWorld));

            let clipboardShareButton = global.world.addWorldObject(new ImageShareButton(global.gameWidth/2 - 80, 201));
            clipboardShareButton.alpha = 0;
            World.Actions.orderWorldObjectBefore(clipboardShareButton, global.world.select.type(YourTeamWorld));

            if (IS_MOBILE) {
                clipboardShareButton.removeFromWorld();
            }

            let twitterShareButton = global.world.addWorldObject(new TwitterShareButton(global.gameWidth/2 - 63, 201, 'win'));
            twitterShareButton.alpha = 0;
            World.Actions.orderWorldObjectBefore(twitterShareButton, global.world.select.type(YourTeamWorld));

            let continueButtonText = 'Main Menu >';
            let continueButtonFilters: TextureFilter[] = [];
            if (isEscape()) {
                continueButtonText = 'ESCAPE >';
                continueButtonFilters = [new StaticFilter(0xFFFFFF, 1)];
            } else if (isBallmanacToComplete()) {
                continueButtonText = '[r]C[color 0xFF7F00]o[y]m[g]p[color 0x0000FF]l[color 0x4B0082]e[color 0x9400D3]t[r]e >';
                continueButtonFilters = [new HueSpinFilter()];
            } else if (DAILY) {
                continueButtonText = 'Results >';
            }

            let areYouSureShown = false;
            let continueSelection: 'continue' | 'victorylap' = undefined;
            let continueButton = global.world.addWorldObject(new MenuTextButton({
                name: 'continuebutton',
                x: global.gameWidth/2 + 8, y: 195,
                text: continueButtonText,
                style: { color: 0xFFFFFF },
                effects: { post: { filters: continueButtonFilters }},
                alpha: 0,
                useGlobalTime: true,
                onClick: () => {
                    global.game.playSound('click');
                    if (!isEscape() && !areYouSureShown && priorLap > 1) {
                        areYouSureShown = true;
                        continueButton.runScript(function*() {
                            yield S.tween(0.1, continueButton, 'alpha', 1, 0.4, Tween.Easing.OutQuad);
                            continueButton.setText("Are you sure? >");
                            yield S.tween(0.1, continueButton, 'alpha', 0.4, 1, Tween.Easing.InQuad);
                        });
                    } else {
                        continueButton.enabled = false;
                        victoryLapButton.enabled = false;
                        continueSelection = 'continue';
                    }
                }
            }));
            World.Actions.orderWorldObjectBefore(continueButton, global.world.select.type(YourTeamWorld));

            let victoryLapButton = global.world.addWorldObject(new MenuTextButton({
                name: 'victorylapbutton',
                x: global.gameWidth/2, y: 224,
                text: '<crownl><crownr> I WANT TO KEEP PLAYING <crownl><crownr>',
                font: 'smallnumbers',
                style: { color: 0xFFD800 },
                anchor: Vector2.CENTER,
                alpha: 0,
                hoverColor: 0xBB8400,
                onClick: () => {
                    global.game.playSound('click');
                    continueButton.enabled = false;
                    victoryLapButton.enabled = false;
                    continueSelection = 'victorylap';
                }
            }));
            victoryLapButton.enabled = false;
            World.Actions.orderWorldObjectBefore(victoryLapButton, global.world.select.type(YourTeamWorld));

            yield [
                S.tween(1*timeScale, continueButton, 'alpha', 0, 1),
                S.tween(1*timeScale, shareText, 'alpha', 0, 1),
                S.tween(1*timeScale, clipboardShareButton, 'alpha', 0, 1),
                S.tween(1*timeScale, twitterShareButton, 'alpha', 0, 1),
            ];

            if (!DAILY) {
                victoryLapButton.enabled = true;
                let waitForVictoryLapButton = priorLap <= 1 ? 3 : 0;
                global.theater.runScript(S.chain(
                    S.wait(waitForVictoryLapButton*timeScale),
                    S.simul(
                        S.tween(3*timeScale, victoryLapButton, 'alpha', 0, 1),
                        S.doOverTime(3*timeScale, t => victoryLapButton.x = global.gameWidth/2 + (1-t)*Random.float(-4, 4)),
                    ),
                ));
            }
            
            yield S.waitUntil(() => continueSelection);
            result.continueSelection = continueSelection;
        }
    }

    export function showVsResult() {
        return function*() {
            let timeScale = getBattleTransitionTimeScale();

            let wins = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 23,
                text: `[rb]R[/rb] ${GAME_DATA.round}   <clock> ${secondsToFormattedTime(GAME_DATA.gameTime)}`,
                style: { color: 0xFFFFFF },
                anchor: Vector2.CENTER,
                alpha: 0,
            }));
            yield S.tween(2*timeScale, wins, 'alpha', 0, 1);
            yield S.wait(1*timeScale);

            let youAreWinner: boolean, winnerName: string, loserName: string, winnerSquad: Squad, loserSquad: Squad, winnerHealth: number, loserHealth: number;
            if (VS_GAME.enemyhealth <= VS_GAME.yourhealth) {
                youAreWinner = true;
                winnerName = VS_GAME.yourname;
                loserName = VS_GAME.enemyname;
                winnerSquad = VS_GAME.yoursquad || VS_GAME.yourlastsquad;
                loserSquad = VS_GAME.enemysquad || VS_GAME.enemylastsquad;
                winnerHealth = VS_GAME.yourhealth;
                loserHealth = VS_GAME.enemyhealth;
            } else {
                youAreWinner = false;
                winnerName = VS_GAME.enemyname;
                loserName = VS_GAME.yourname;
                winnerSquad = VS_GAME.enemysquad || VS_GAME.enemylastsquad;
                loserSquad = VS_GAME.yoursquad || VS_GAME.yourlastsquad;
                winnerHealth = VS_GAME.enemyhealth;
                loserHealth = VS_GAME.yourhealth;
            }

            Random.seed(getRandomSeed(GAME_DATA.gameId, DAILY));
            let vsResult = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: global.gameHeight/2,
                text: `${winnerName}  [r]<heart>[/r]${winnerHealth}\n[gold]~ ${Random.element(VS_DEFEATED_VERBS)} ~[/gold]\n${loserName}  [r]<heart>[/r]${loserHealth}`,
                anchor: Vector2.CENTER,
                justify: 'center',
                alpha: 0,
            }));

            yield [
                showVsSquads(global.gameHeight/2, youAreWinner, winnerSquad, loserSquad, timeScale),
                S.tween(1*timeScale, vsResult, 'alpha', 0, 1),
            ];

            yield S.wait(2*timeScale);

            let shareText = global.world.addWorldObject(new SpriteText({
                name: 'sharetext',
                x: global.gameWidth/2 - 52, y: 215,
                text: 'SHARE :)',
                anchor: Vector2.CENTER_LEFT,
                font: 'smallnumbers',
                alpha: 0,
            }));
            World.Actions.orderWorldObjectBefore(shareText, global.world.select.type(YourTeamWorld));

            let clipboardShareButton = global.world.addWorldObject(new ImageShareButton(global.gameWidth/2 - 80, 214));
            clipboardShareButton.alpha = 0;
            World.Actions.orderWorldObjectBefore(clipboardShareButton, global.world.select.type(YourTeamWorld));

            if (IS_MOBILE) {
                clipboardShareButton.removeFromWorld();
            }

            let twitterShareButton = global.world.addWorldObject(new TwitterShareButton(global.gameWidth/2 - 63, 214, youAreWinner ? 'win' : 'loss'));
            twitterShareButton.alpha = 0;
            World.Actions.orderWorldObjectBefore(twitterShareButton, global.world.select.type(YourTeamWorld));

            let shouldContinue = false;
            let continueButton = global.world.addWorldObject(new MenuTextButton({
                name: 'continuebutton',
                x: global.gameWidth/2 + 8, y: 208,
                text: 'Continue >',
                style: { color: 0xFFFFFF },
                alpha: 0,
                onClick: () => {
                    global.game.playSound('click');
                    continueButton.enabled = false;
                    shouldContinue = true;
                }
            }));
            World.Actions.orderWorldObjectBefore(continueButton, global.world.select.type(YourTeamWorld));
            yield [
                S.tween(1*timeScale, continueButton, 'alpha', 0, 1),
                S.tween(1*timeScale, shareText, 'alpha', 0, 1),
                S.tween(1*timeScale, clipboardShareButton, 'alpha', 0, 1),
                S.tween(1*timeScale, twitterShareButton, 'alpha', 0, 1),
            ];

            yield S.waitUntil(() => shouldContinue);
        }
    }

    export function showGameOver() {
        return function*() {
            let timeScale = getBattleTransitionTimeScale();

            let round = GAME_DATA.round-1;

            let totalWins = GAME_DATA.wins + (GAME_DATA.lap-1)*8;
            let totalMaxWins = GET_MAX_WINS() + (GAME_DATA.lap-1)*8;
            let winsText = GAME_DATA.lap === 1 ? `${totalWins}/${totalMaxWins}` : `[gold]${totalWins}/${totalMaxWins}[/gold]`;
            let wins = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 38,
                text: `[gold]<trophy>[/gold] ${winsText}   [r]<heart>[/r] ${GAME_DATA.health}   [rb]R[/rb] ${round}   <clock> ${secondsToFormattedTime(GAME_DATA.gameTime)}`,
                style: { color: 0xFFFFFF },
                anchor: Vector2.CENTER,
                alpha: 0,
            }));
            yield S.tween(2*timeScale, wins, 'alpha', 0, 1);
            yield S.wait(1*timeScale);

            if (!isEscape()) global.theater.playSound('lose');

            let gameover = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2 + 24, y: 66,
                text: escapeGarble(`GAME OVER...`),
                scale: 2,
                style: { color: isEscape() ? 0xDDDDDD : 0xFF0000 },
                anchor: Vector2.CENTER,
                alpha: 0,
            }));
            yield S.tween(1*timeScale, gameover, 'alpha', 0, 1);
            yield S.wait(1*timeScale);

            yield showYourSquad(88, false, timeScale, GAME_DATA.lap);
            yield S.wait(1*timeScale);
            
            let tryharder = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 154,
                text: escapeGarble(Random.element(GAMEOVER_MESSAGES)),
                style: { color: 0xFFFFFF },
                justify: 'center',
                anchor: Vector2.TOP,
                alpha: 0,
            }));
            World.Actions.orderWorldObjectBefore(tryharder, global.world.select.type(YourTeamWorld));
            yield S.tween(1*timeScale, tryharder, 'alpha', 0, 1);
            yield S.wait(2*timeScale);

            let shareText = global.world.addWorldObject(new SpriteText({
                name: 'sharetext',
                x: global.gameWidth/2 - 52, y: 174 + tryharder.getTextHeight(),
                text: 'SHARE :)',
                anchor: Vector2.CENTER_LEFT,
                font: 'smallnumbers',
                alpha: 0,
            }));
            World.Actions.orderWorldObjectBefore(shareText, global.world.select.type(YourTeamWorld));

            let clipboardShareButton = global.world.addWorldObject(new ImageShareButton(global.gameWidth/2 - 80, 173 + tryharder.getTextHeight()));
            clipboardShareButton.alpha = 0;
            World.Actions.orderWorldObjectBefore(clipboardShareButton, global.world.select.type(YourTeamWorld));

            if (IS_MOBILE) {
                clipboardShareButton.removeFromWorld();
            }

            let twitterShareButton = global.world.addWorldObject(new TwitterShareButton(global.gameWidth/2 - 63, 173 + tryharder.getTextHeight(), 'loss'));
            twitterShareButton.alpha = 0;
            World.Actions.orderWorldObjectBefore(twitterShareButton, global.world.select.type(YourTeamWorld));

            let continueButtonText = 'Main Menu >';
            let continueButtonFilters: TextureFilter[] = [];
            if (isEscape()) {
                continueButtonText = 'ESCAPE >';
                continueButtonFilters = [new StaticFilter(0xFFFFFF, 1)];
            } else if (DAILY) {
                continueButtonText = 'Results >';
            }

            let continueButtonClicked = false;
            let continueButton = global.world.addWorldObject(new MenuTextButton({
                name: 'continuebutton',
                x: global.gameWidth/2 + 8, y: 166 + tryharder.getTextHeight(),
                text: continueButtonText,
                style: { color: 0xFFFFFF },
                effects: { post: { filters: continueButtonFilters }},
                alpha: 0,
                useGlobalTime: true,
                onClick: () => {
                    global.game.playSound('click');
                    continueButton.enabled = false;
                    continueButtonClicked = true;
                }
            }));
            World.Actions.orderWorldObjectBefore(continueButton, global.world.select.type(YourTeamWorld));
            yield [
                S.tween(1*timeScale, continueButton, 'alpha', 0, 1),
                S.tween(1*timeScale, shareText, 'alpha', 0, 1),
                S.tween(1*timeScale, clipboardShareButton, 'alpha', 0, 1),
                S.tween(1*timeScale, twitterShareButton, 'alpha', 0, 1),
            ];

            yield S.waitUntil(() => continueButtonClicked);
        }
    }

    export function showWin() {
        return function*() {
            global.theater.playSound('win');

            if (vsOpponentHadDoveBallInSquadLastRound()) {
                global.world.addWorldObject(new SpriteText({
                    x: global.gameWidth/2, y: 55,
                    text: '<dove1><dove2> Opponent Protected!',
                    style: { color: 0xFFFFFF },
                    anchor: Vector2.CENTER,
                }));
            }

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 110,
                text: ' WIN!',
                scale: 2,
                style: { color: 0x00FF00 },
                anchor: Vector2.CENTER,
            }));

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 135,
                text: `[gold]<trophy>[/gold] ${GET_MAX_WINS() - GAME_DATA.wins} to go...`,
                style: { color: 0xFFFFFF },
                anchor: Vector2.CENTER,
            }));

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 163,
                text: Random.element(WIN_MESSAGES),
                style: { color: 0xFFFFFF },
                justify: 'center',
                anchor: Vector2.TOP,
            }));
        }
    }

    export function showLose() {
        return function*() {
            global.theater.playSound('lose');

            if (hasDoveBallInSquad()) {
                global.world.addWorldObject(new SpriteText({
                    x: global.gameWidth/2, y: 55,
                    text: '<dove1><dove2> Protected!',
                    style: { color: 0xFFFFFF },
                    anchor: Vector2.CENTER,
                }));
            }

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 110,
                text: 'LOSS',
                scale: 2,
                style: { color: 0xFF0000 },
                anchor: Vector2.CENTER,
            }));

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 135,
                text: `[color 0xFF0000]<heart>[/] ${GAME_DATA.health} left...`,
                style: { color: 0xFFFFFF },
                anchor: Vector2.CENTER,
            }));

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 167,
                text: Random.element(LOSE_MESSAGES),
                style: { color: 0xFFFFFF },
                justify: 'center',
                anchor: Vector2.TOP,
            }));
        }
    }

    export function showDraw(type: 'timeout' | 'normal') {
        return function*() {
            global.theater.playSound('draw');

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 110,
                text: 'DRAW',
                scale: 2,
                style: { color: 0xFFFFFF },
                anchor: Vector2.CENTER,
            }));

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 128,
                text: type === 'timeout' ? "The battle timed out!" : Random.element(DRAW_MESSAGES),
                style: { color: 0xFFFFFF },
                justify: 'center',
                anchor: Vector2.TOP,
            }));
        }
    }

    export function showSpectateNonDraw(winner: string, drawType: 'normal' | 'timeout') {
        return function*() {
            global.theater.playSound('win');

            let winText = "";
            if (winner) {
                winText = `[gold]${winner}[/gold]\n[offsetx 2]WINS ROUND ${VS_GAME.round-1}![/]`;
            } else {
                winText = 'DRAW';
            }

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 66,
                text: winText,
                scale: 2,
                anchor: Vector2.CENTER,
                justify: 'center',
            }));

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 130,
                text: `${VS_GAME.yourname} [r]<heart>[/r]${VS_GAME.yourhealth}\n${VS_GAME.enemyname} [r]<heart>[/r]${VS_GAME.enemyhealth}`,
                style: { color: 0xFFFFFF },
                anchor: Vector2.CENTER,
                justify: 'left',
            }));

            global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 175,
                text: drawType === 'timeout' ? "The battle timed out!" : Random.element(SPECTATE_MESSAGES),
                style: { color: 0xFFFFFF },
                justify: 'center',
                anchor: Vector2.TOP,
            }));
        }
    }

    function showYourSquad(y: number, win: boolean, timeScale: number, priorLap: number): Script.Function {
        return function*() {
            let yourSquadText = global.world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: y,
                text: escapeGarble(win ? `~ ${crownedName(GAME_DATA.squad.name)}'s WINNING Squad ~` : `~ ${GAME_DATA.squad.name}'s Squad ~`),
                style: { color: 0xFFFFFF },
                justify: 'center',
                anchor: Vector2.TOP,
                alpha: 0,
            }));
            yield S.tween(1*timeScale, yourSquadText, 'alpha', 0, 1);

            let yourTeamWorld = global.world.addWorldObject(createTeamWorld());
            addSquadToTeamWorld(yourTeamWorld.containedWorld, y + 40, GAME_DATA.squad, 'friend', false);
            yield S.tween(1*timeScale, yourTeamWorld, 'alpha', 0, 1);

            if (GAME_MODE === 'mm' && win && priorLap === 1) {
                function addWin(p: Pt, i: number, numBalls: number, book: Sprite) {
                    global.theater.playSound('buyball', { volume: 0.6, speed: Math.pow(2, [0, 2, 4, 5, 7, 9, 11][i % 7]/12) });

                    let win = yourTeamWorld.containedWorld.addWorldObject(new SpriteText({
                        x: p.x, y: p.y - 5,
                        text: '[gold][offsetx 0]<crown>[/][/]',
                        anchor: Vector2.CENTER,
                        effects: { outline: {} },
                        alpha: 0,
                    }));

                    win.runScript(function*() {
                        yield [
                            S.tween(1*timeScale, win, 'y', win.y, win.y - 10, Tween.Easing.OutCubic),
                            S.tween(1*timeScale, win, 'alpha', 0, 1, Tween.Easing.OutCubic),
                        ];

                        yield S.wait(0.3*(numBalls-1-i)*timeScale);

                        yield [
                            S.tween(0.5*timeScale, win, 'x', win.x, book.x, Tween.Easing.InCubic),
                            S.tween(0.5*timeScale, win, 'y', win.y, book.y, Tween.Easing.InQuad),
                        ];

                        global.theater.playSound('bookopen', { volume: 0.6 });
                        book.runScript(S.tween(0.1, book, 'scale', 1.2, 1));
                        win.kill();
                    });
                }

                yourTeamWorld.runScript(function*() {
                    let book = yourTeamWorld.containedWorld.addWorldObject(new Sprite({
                        x: 270, y: 130,
                        texture: 'almanacicon/open',
                        alpha: 0,
                    }));

                    book.runScript(S.tween(0.5, book, 'alpha', 0, 1));

                    let balls = yourTeamWorld.containedWorld.select.typeAll(Ball);
                    let i = 0;
                    for (let ball of balls) {
                        addWin(ball, i, balls.length, book);
                        yield S.wait(0.2*timeScale);
                        i++;
                    }

                    yield S.wait(2*timeScale);
                    yield S.tween(0.2*timeScale, book, 'scale', 1, 1.1);
                    global.theater.playSound('bookclose', { volume: 0.5 });
                    book.setTexture('almanacicon/closed');
                    book.x += 3;
                    yield S.tween(0.2*timeScale, book, 'scale', 1.1, 0.9);
                    yield S.tween(0.1*timeScale, book, 'scale', 0.9, 1);
                    yield S.wait(0.25*timeScale);

                    let percent = Math.floor(getAlmanacTotalCompletionPercent().won * 100);
                    let completion = yourTeamWorld.containedWorld.addWorldObject(new SpriteText({
                        x: book.x+2, y: book.y-1,
                        text: `${percent}%`,
                        font: 'smallnumbers',
                        style: { color: 0xFFD800 },
                        anchor: Vector2.CENTER,
                        alpha: 0,
                    }));

                    yield S.schedule(
                        0, S.tween(1*timeScale, book, 'alpha', 1, 0),
                        0.5*timeScale, S.tween(1*timeScale, completion, 'alpha', 0, 1),
                        3, S.tween(1, completion, 'alpha', 1, 0),
                    );
                });
            }
        }
    }

    function showVsSquads(y: number, youAreWinner: boolean, topSquad: Squad, bottomSquad: Squad, timeScale: number) {
        return function*() {
            let yourTeamWorld = global.world.addWorldObject(createTeamWorld());
            addSquadToTeamWorld(yourTeamWorld.containedWorld, y - 56, topSquad, youAreWinner ? 'friend' : 'enemy', true);
            addSquadToTeamWorld(yourTeamWorld.containedWorld, y + 52, bottomSquad, youAreWinner ? 'enemy' : 'friend', false);

            yield S.tween(1*timeScale, yourTeamWorld, 'alpha', 0, 1);
        }
    }

    function escapeGarble(text: string) {
        let result = '';
        for (let char of text) {
            if (isEscape() && char.match(/[a-zA-Z]/i)) {
                result += `<g${Random.int(1, 5)}>`;
            } else {
                result += char;
            }
        }
        return result;
    }

    function isEscape() {
        return GAME_DATA.arg2Trigger.strategy;
    }

    function isBotted() {
        return GAME_DATA.offlineCount >= 10;
    }
}

function isBallmanacToComplete() {
    return hasCompletedAchievement('CompleteTheBallmanac') && !loadSeenAlmanacComplete();
}