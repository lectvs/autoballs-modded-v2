function createVsGame(world: World, settings: VSModeSettings.Settings) {
    return function*() {
        global.game.allowPauseWithPauseKey = false;

        world.select.modules(Button).forEach(button => button.enabled = false);

        let fade = world.addWorldObject(new Sprite({
            texture: Texture.filledRect(world.width, world.height, 0x000000, 0.85),
            alpha: 0,
        }));

        let createVsGameText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: global.gameHeight/2 - 60,
            text: 'Creating a game...',
            anchor: Vector2.CENTER,
            alpha: 0,
        }));

        let createVsGameSpinner = world.addWorldObject(new Spinner(world.width/2, global.gameHeight/2, 4, 16));
        createVsGameSpinner.alpha = 0;

        yield S.doOverTime(1, t => {
            fade.alpha = t;
            createVsGameText.alpha = t;
            createVsGameSpinner.alpha = t;
            if (global.game.musicManager.currentMusic) {
                global.game.musicManager.currentMusic.volume = 1-0.5*t;
            }
        });

        let frameRate = Persistence.getAverageFrameRate();

        let hostPacks = settings.hostPack === PACK_ALL_ID ? OFFICIAL_PACKS : [settings.hostPack];
        let nonhostPacks = settings.nonhostPack === PACK_ALL_ID ? OFFICIAL_PACKS : [settings.nonhostPack];

        let gameid: string;
        let err: string;
        let callDone = false;
        API.createvsgame((_gameid: string, e: string) => {
            gameid = _gameid;
            err = e;
            callDone = true;
            debug('Got VS gameid:', gameid);
        }, loadName(), settings.startHealth, getAvailableBallTypesOnlyUnlocked(), getAvailableItemTypesOnlyUnlocked(), frameRate === 0 ? 1/60 : 1/frameRate, Persistence.getProfileId(),
        settings.startRound, settings.startGameGold, settings.startRoundGold, settings.maxSquadSize, settings.timeLimit, settings.speedCap, settings.arena, hostPacks, nonhostPacks);

        let startTime = Date.now();

        yield S.waitUntil(() => callDone || Date.now() - startTime > 5000);
        if (!callDone) {
            err = ERROR_TIMED_OUT;
        }

        // :)
        let totalTime = Random.int(500, 1000);
        yield S.waitUntil(() => Date.now() - startTime > totalTime);

        yield S.doOverTime(0.5, t => {
            createVsGameText.alpha = 1-t;
        });
        createVsGameText.kill();

        if (err) {
            yield createVsGameError(world, fade);
        } else {
            yield waitForJoinVsGame(world, gameid);
        }
    }
}

function waitForJoinVsGame(world: World, gameid: string) {
    return function*() {
        let codeText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: global.gameHeight/2 - 60,
            text: gameid,
            anchor: Vector2.CENTER,
            scale: 3,
            alpha: 0,
        }));

        let waitingForJoinText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: global.gameHeight/2 + 52,
            text: 'Waiting for another player\nto join with the code above...',
            anchor: Vector2.TOP_CENTER,
            justify: 'center',
            alpha: 0,
        }));

        yield S.doOverTime(1, t => {
            codeText.alpha = t;
            waitingForJoinText.alpha = t;
            if (global.game.musicManager.currentMusic) {
                global.game.musicManager.currentMusic.volume = 1-0.5*t;
            }
        });

        world.runScript(function*() {
            yield S.wait(3);
            let backButton = world.addWorldObject(new MenuTextButton({
                x: 4, y: global.gameHeight - 18,
                text: "\\< back",
                alpha: 0,
                onClick: () => {
                    global.theater.loadStage(() => VSModeScreen.STAGE(loadVsSettings()));
                }
            }));
            yield S.doOverTime(1, t => backButton.alpha = M.lerp(0, 1, t));
        });

        let errorText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 220,
            anchor: Vector2.CENTER,
            style: { color: 0x888888 },
        }));

        let result: { game?: API.VSGame } = {};
        yield GameFragments.waitForVSGameCondition(gameid, loadName(), false, game => game.enemyname, result, err => errorText.setText(err ? 'An error occurred' : ''));

        GameFragments.startVsGame(gameid, result.game, true, false);
    }
}

function createVsGameError(world: World, fade: Sprite) {
    return function*() {
        let spinner = world.select.type(Spinner);

        yield S.doOverTime(0.5, t => {
            spinner.alpha = 1-t;
        });
        spinner.kill();

        let foundOpponentTextTop = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 110,
            text: 'Failed to create game :(',
            anchor: Vector2.CENTER,
            alpha: 0,
        }));
        let foundOpponentTextBottom = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 130,
            text: 'Please try again!',
            anchor: Vector2.CENTER,
            alpha: 0,
        }));

        yield S.doOverTime(0.5, t => {
            foundOpponentTextTop.alpha = t;
            foundOpponentTextBottom.alpha = t;
        });

        yield S.wait(2);

        yield S.doOverTime(0.5, t => {
            fade.alpha = 1-t;
            foundOpponentTextTop.alpha = 1-t;
            foundOpponentTextBottom.alpha = 1-t;
        });
        fade.kill();
        foundOpponentTextTop.kill();
        foundOpponentTextBottom.kill();

        world.select.modules(Button).forEach(button => button.enabled = true);
    }
}