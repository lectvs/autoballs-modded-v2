namespace EnterGameCode {
    const CODE_LENGTH = 4;

    export function STAGE_VERSUS() {
        return STAGE(false);
    }

    export function STAGE_SPECTATE() {
        return STAGE(true);
    }

    function STAGE(spectate: boolean) {
        let world = new World();

        let enterGameIdY = IS_MOBILE ? 28 : 80;
        let gameIdTextY = IS_MOBILE ? 68 : 120;
        let joinButtonTextThingY = IS_MOBILE ? 108 : 160;
        let errorTextY = IS_MOBILE ? 108 : 212;
        let rejoinTextY = IS_MOBILE ? 108 : 212;
    
        world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: enterGameIdY,
            text: spectate ? 'Enter GAME ID to spectate:' : 'Enter GAME ID:',
            anchor: Vector2.TOP_CENTER,
        }));

        let enteredCode = '';

        let gameIdText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: gameIdTextY,
            text: '_',
            anchor: Vector2.TOP_CENTER,
            update: function() {
                if (this.life.time > 0.1) updateChars(typeChar);
            },
        }));

        let joinButtonTextThing: SpriteText;

        if (IS_MOBILE) {
            joinButtonTextThing = world.addWorldObject(new SpriteText({
                x: global.gameWidth/2 - 44, y: joinButtonTextThingY,
                text: "",
                anchor: Vector2.CENTER_LEFT,
            }));
            world.addWorldObject(new Keyboard(global.gameWidth/2, 186, typeChar, 'gameid'));
        } else {
            joinButtonTextThing = world.addWorldObject(new MenuTextButton({
                x: global.gameWidth/2 - 44, y: joinButtonTextThingY,
                text: "join game >",
                onClick: () => {
                    submitCode();
                },
            }));
        }

        let errorText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: errorTextY,
            text: '',
            anchor: Vector2.CENTER,
            justify: 'center',
            style: { color: 0xBB0000 },
        }));

        let rejoinText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: rejoinTextY,
            text: '',
            font: 'smallnumbers',
            anchor: Vector2.CENTER,
            justify: 'center',
            style: { color: 0xBB0000 },
        }));

        world.addWorldObject(new MenuTextButton({
            name: 'backbutton',
            x: 4, y: global.gameHeight - 18,
            text: "\\< back",
            onClick: () => {
                Input.preventRegularKeyboardInput = false;
                global.theater.loadStage(() => VSModeScreen.STAGE(loadVsSettings()));
                global.game.playSound('click');
            }
        }));

        world.onTransitioned = function() {
            global.game.stopMusic();
            Input.preventRegularKeyboardInput = true;
            let lastVsGame = loadVersusModeGameData({ type: 'last' });
            if (lastVsGame && !spectate) {
                enteredCode = lastVsGame.gameData.gameId;
                gameIdText.setText(`${St.replaceAll(enteredCode, ' ', '\\ ')}_`);
            }
        }

        function submitCode() {
            global.game.playSound('click');
            if (enteredCode.length < CODE_LENGTH) {
                // Pass
            } else {
                disable();
                errorText.setText('');
                rejoinText.setText('');
                world.runScript(attemptJoin(world, enteredCode, spectate, joinButtonTextThing, handleJoinError));
            }
        }

        function glitch() {
            world.runScript(function*() {
                world.playSound('arg/glitch_short_low');
                world.effects.post.filters.push(new TextureFilters.Tint(0xFF0000));
                world.effects.glitch.enabled = true;
                world.effects.glitch.strength = 4;
                world.effects.glitch.speed = 0.5;
                world.effects.glitch.spread = 4;
                yield S.wait(0.1);
                world.effects.glitch.strength = 1;
                world.effects.glitch.spread = 8;
            });
        }

        function unglitch() {
            let i = world.effects.post.filters.findIndex(f => f instanceof TextureFilters.Tint);
            if (i >= 0) {
                world.effects.post.filters.splice(i, 1);
            }
            world.effects.glitch.enabled = false;
        }
        
        function resetWithError(error: string) {
            rejoinText.setText('');
            errorText.setText(error);
            joinButtonTextThing.style.color = 0xFFFFFF;
            joinButtonTextThing.setText(IS_MOBILE ? "" : "join game >");
            world.select.name('joinspinner', false)?.kill();
            enable();
        }

        function handleJoinError(err: string) {
            if (!err) return;
            if (err === 'GAME_DOES_NOT_EXIST') {
                resetWithError("Game does not exist");
            } else if (err === 'VERSION_MISMATCH') {
                resetWithError("Version mismatch");
            } else if (err === 'GAME_ENDED') {
                resetWithError("The game has already ended");
            } else if (err === 'GAME_IN_PROGRESS') {
                resetWithError("Game is in progress");
            } else if (err === 'SAME_NAME_AS_HOST') {
                resetWithError("Cannot join with the same name as the host");
            } else if (err === 'SAME_PROFILE_AS_HOST') {
                resetWithError("You are already the host of this game");
            } else {
                resetWithError("An error occurred");
            }
        }

        function disable() {
            for (let b of world.select.modules(Button)) {
                b.enabled = false;
            }
            gameIdText.setActive(false);
        }

        function enable() {
            for (let b of world.select.modules(Button)) {
                b.enabled = true;
            }
            gameIdText.setActive(true);
        }

        function typeChar(char: string) {
            if (char === 'Backspace') {
                if (enteredCode.length > 0) {
                    enteredCode = enteredCode.substring(0, enteredCode.length-1);
                    global.game.playSound('typename');
                    unglitch();
                }
            } else if (char === 'Enter') {
                submitCode();
            } else if (char === 'Escape') {
                Input.consume(Input.GAME_CLOSE_MENU);
                Input.preventRegularKeyboardInput = false;
                global.theater.loadStage(() => VSModeScreen.STAGE(loadVsSettings()));
            } else {
                if (enteredCode.length < CODE_LENGTH) {
                    enteredCode += char;
                    global.game.playSound('typename');
                    if (enteredCode === 'BETA' && !spectate && !IS_MOBILE) {
                        glitch();
                    }
                }
            }
            gameIdText.setText(`${St.replaceAll(enteredCode, ' ', '\\ ')}_`);
        }
    
        return world;
    }

    function attemptJoin(world: World, gameid: string, spectate: boolean, joinButtonTextThing: SpriteText, errorCallback: (err: string) => void) {
        return function*() {
            joinButtonTextThing.style.color = 0x666666;
            joinButtonTextThing.setText("joining...");

            let joinButtonBounds = joinButtonTextThing.getTextWorldBounds()

            let joinSpinner = world.addWorldObject(new Spinner(joinButtonBounds.x - 10, joinButtonBounds.y + 7, 1.5, 4));
            joinSpinner.name = 'joinspinner';

            yield S.wait(1);

            if (gameid === 'BETA' && !spectate && !IS_MOBILE) {
                Input.preventRegularKeyboardInput = false;
                if (GAME_DATA.arg2Trigger) GAME_DATA.arg2Trigger.strategy = false;
                global.theater.playCutscene(ARG.Cutscenes.BEGIN_ARG_2);
                return;
            }

            if (!spectate) {
                let frameRate = Persistence.getAverageFrameRate();
            
                let err: string;
                let callDone = false;
                API.joinvsgame((_: undefined, e: string) => {
                    err = e;
                    callDone = true;
                }, gameid, loadName(), getAvailableBallTypesOnlyUnlocked(), getAvailableItemTypesOnlyUnlocked(), frameRate === 0 ? 1/60 : 1/frameRate, Persistence.getProfileId());
        
                let startTime = Date.now();
        
                yield S.waitUntil(() => callDone || Date.now() - startTime > 5000);
                if (!callDone) {
                    err = ERROR_TIMED_OUT;
                }
                
                if (err) {
                    console.error('Failed to join game:', err);
                    errorCallback(err);
                    return;
                }

                debug('Joined VS game:', gameid);
            }

            joinButtonTextThing.setText("fetching game\ndetails...");
            yield S.wait(1);

            if (spectate) {
                let err: string;
                let game: API.VSGame;
                API.getvsgame((result: API.VSGame, e: string) => {
                    err = e;
                    game = result;
                }, gameid, loadName(), spectate, true, Persistence.getProfileId());
        
                let startTime = Date.now();
                yield S.waitUntil(() => game || err || Date.now() - startTime > 5000);
                if (!game && !err) {
                    err = ERROR_TIMED_OUT;
                }
                
                if (err) {
                    console.error('Failed to get VS game details:', err);
                    errorCallback(err);
                    return;
                }

                debug('Got VS game details:', gameid, game);

                if (!game.enemyname) {
                    joinButtonTextThing.setText("waiting for\nplayers to\njoin...");
                    world.select.name<MenuTextButton>('backbutton').enabled = true;
                }

                yield S.wait(2);
            }

            let result: { game?: API.VSGame } = {};
            yield GameFragments.waitForVSGameCondition(gameid, loadName(), spectate, game => game.enemyname, result, err => errorCallback(err ? 'An error occurred' : ''));

            GameFragments.startVsGame(gameid, result.game, true, spectate);
        }
    }

    function updateChars(callback: (char: string) => void) {
        for (let char in CHARS_DOWN) {
            let oldDown = CHARS_DOWN[char];
            let newDown = Input.isKeyCodeDown(char);
            if (newDown && !oldDown) {
                if (char.length === 1) {
                    callback(char.toUpperCase());
                } else {
                    callback(char);
                }
            }
            CHARS_DOWN[char] = newDown;
        }
    }

    const CHARS_DOWN: Dict<boolean> = {
        'a': false, 'b': false, 'c': false, 'd': false, 'e': false, 'f': false, 'g': false, 'h': false, 'i': false, 'j': false, 'k': false, 'l': false, 'm': false,
        'n': false, 'o': false, 'p': false, 'q': false, 'r': false, 's': false, 't': false, 'u': false, 'v': false, 'w': false, 'x': false, 'y': false, 'z': false,
        '0': false, '1': false, '2': false, '3': false, '4': false, '5': false, '6': false, '7': false, '8': false, '9': false,
        'Backspace': false, 'Enter': false, 'Escape': false,
    };
}
