var VS_TIP_NUM = 0;
const VS_TIPS = [
    `(Each round, you and your opponent receive the same shops!)`,
    `(Your opponent is adapting to your squad... can you adapt faster?)`,
    `("The key to victory is finding your opponent's weak point."\n~ Ballam)`,
];

function findOpponentVs(world: World, autoplay: boolean = false) {
    return function*() {
        global.game.allowPauseWithPauseKey = false;

        world.select.modules(Button).forEach(button => button.enabled = false);
        world.select.type(BallMover).removeFromWorld();
        world.select.type(BallFreezer).removeFromWorld();
        world.select.type(BallHighlighter).enabled = false;
        world.select.type(InfoBox).enabled = false;
        world.select.type(BoundsInfoBox).enabled = false;
        world.select.type(VsStatusCheckmarker).removeFromWorld();

        yield waitUntilFindOpponentDelayComplete(world);

        setBallPositions(world);

        let fade = world.addWorldObject(new Sprite({
            texture: Texture.filledRect(world.width, world.height, 0x000000, 0.8),
            alpha: 0,
        }));

        let waitingForText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 136,
            text: autoplay ? `Waiting for ${VS_GAME.enemyname}...` : `Submitting squad...`,
            anchor: Vector2.TOP_CENTER,
            alpha: 0,
        }));

        let waitingForSpinner = world.addWorldObject(new Spinner(world.width/2, 100, 4, 16));
        waitingForSpinner.alpha = 0;

        yield S.doOverTime(1, t => {
            fade.alpha = t;
            waitingForText.alpha = t;
            waitingForSpinner.alpha = t;
            if (global.game.musicManager.currentMusic) {
                global.game.musicManager.currentMusic.volume = 1-0.5*t;
            }
        });

        let tipText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: global.gameHeight-8,
            text: VS_TIPS[VS_TIP_NUM],
            maxWidth: global.gameWidth-40,
            anchor: Vector2.BOTTOM_CENTER,
            justify: 'center',
            style: { color: 0xAAAAAA },
            alpha: 0,
        }));
        yield S.tween(1, tipText, 'alpha', 0, 1);

        VS_TIP_NUM = M.mod(VS_TIP_NUM+1, VS_TIPS.length);

        let errorText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 178,
            anchor: Vector2.CENTER,
            style: { color: 0x888888 },
        }));

        if (!autoplay) {
            while (true) {
                let err: string;
                let callDone = false;
                API.submitvssquad((_: undefined, _err: string) => {
                    err = _err;
                    callDone = true;
                    if (!err) debug('Submitted VS squad:', GAME_DATA.squad);
                }, GAME_DATA.gameId, GAME_DATA.squad.name, GAME_DATA.round, GAME_DATA.squad, Persistence.getProfileId());
        
                let startTime = Date.now();
                yield S.waitUntil(() => callDone || Date.now() - startTime > 5000);
                if (!callDone) {
                    err = ERROR_TIMED_OUT;
                }
        
                if (err) {
                    debug("Error:", err);
                    errorText.setText('An error occurred');
                    yield S.wait(2);
                    continue;
                }

                errorText.setText('');
                break;
            }

            yield S.tween(0.5, waitingForText, 'alpha', 1, 0);
            waitingForText.setText(`Waiting for ${VS_GAME.enemyname}...`);
            yield S.tween(0.5, waitingForText, 'alpha', 0, 1);
        }

        let result: { game?: API.VSGame } = {};
        yield GameFragments.waitForVSGameCondition(GAME_DATA.gameId, GAME_DATA.squad.name, false, game => game.enemysquad || game.round > GAME_DATA.round, result, err => errorText.setText(err ? 'An error occurred' : ''));

        if (result.game.startTime && result.game.startTime >= Date.now() && result.game.startTime <= Date.now() + 6000) {
            yield S.waitUntil(() => Date.now() >= result.game.startTime);
        }

        saveVersusModeGameData({
            gameData: GAME_DATA,
            state: 'battle',
        });

        global.game.stopMusic(1);

        GameFragments.startVsGame(GAME_DATA.gameId, result.game, false, false);
    }
}
