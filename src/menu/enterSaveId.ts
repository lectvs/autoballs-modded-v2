namespace EnterSaveId {
    const ID_LENGTH = 8;

    export function STAGE() {
        let world = new World();

        let enterSaveIdY = IS_MOBILE ? 28 : 80;
        let saveIdTextY = IS_MOBILE ? 68 : 120;
        let useButtonTextThingY = IS_MOBILE ? 108 : 160;
        let errorTextY = IS_MOBILE ? 108 : 212;
    
        world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: enterSaveIdY,
            text: 'Enter SAVE ID:',
            anchor: Vector2.TOP_CENTER,
        }));

        let enteredId = '';

        let saveIdText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: saveIdTextY,
            text: '_',
            anchor: Vector2.TOP_CENTER,
            update: function() {
                if (this.life.time > 0.1) updateChars(typeChar);
            },
        }));

        let useButtonTextThing: SpriteText;

        if (IS_MOBILE) {
            useButtonTextThing = world.addWorldObject(new SpriteText({
                x: global.gameWidth/2 - 44, y: useButtonTextThingY,
                text: "",
                anchor: Vector2.CENTER_LEFT,
            }));
            world.addWorldObject(new Keyboard(global.gameWidth/2, 186, typeChar, 'gameid'));
        } else {
            useButtonTextThing = world.addWorldObject(new MenuTextButton({
                x: global.gameWidth/2 - 44, y: useButtonTextThingY,
                text: "use save id >",
                onClick: () => {
                    submitId();
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

        world.addWorldObject(new MenuTextButton({
            x: 4, y: global.gameHeight - 18,
            text: "\\< back",
            onClick: () => {
                Input.preventRegularKeyboardInput = false;
                global.theater.loadStage(() => CloudSaveScreen.STAGE());
                global.game.playSound('click');
            }
        }));

        world.onTransitioned = function() {
            global.game.stopMusic();
            Input.preventRegularKeyboardInput = true;
        }

        function submitId() {
            global.game.playSound('click');
            if (enteredId.length < ID_LENGTH) {
                // Pass
            } else {
                disable();
                errorText.setText('');
                world.runScript(attemptUse(world, enteredId, useButtonTextThing, handleUseError));
            }
        }
        
        function resetWithError(error: string) {
            errorText.setText(error);
            useButtonTextThing.style.color = 0xFFFFFF;
            useButtonTextThing.setText(IS_MOBILE ? "" : "use save id >");
            world.select.name('usespinner', false)?.kill();
            enable();
        }

        function handleUseError(err: string) {
            if (!err) return;
            if (err === 'NOT_FOUND') {
                resetWithError("Save does not exist");
            } else {
                resetWithError("An error occurred");
            }
        }

        function disable() {
            for (let b of world.select.modules(Button)) {
                b.enabled = false;
            }
            saveIdText.setActive(false);
        }

        function enable() {
            for (let b of world.select.modules(Button)) {
                b.enabled = true;
            }
            saveIdText.setActive(true);
        }

        function typeChar(char: string) {
            if (char === 'Backspace') {
                if (enteredId.length > 0) {
                    enteredId = enteredId.substring(0, enteredId.length-1);
                    global.game.playSound('typename');
                }
            } else if (char === 'Enter') {
                submitId();
            } else if (char === 'Escape') {
                Input.consume(Input.GAME_CLOSE_MENU);
                Input.preventRegularKeyboardInput = false;
                global.theater.loadStage(() => CloudSaveScreen.STAGE());
            } else {
                if (enteredId.length < ID_LENGTH) {
                    enteredId += char;
                    global.game.playSound('typename');
                }
            }
            saveIdText.setText(`${St.replaceAll(enteredId, ' ', '\\ ')}_`);
        }
    
        return world;
    }

    function attemptUse(world: World, saveId: string, useButtonTextThing: SpriteText, errorCallback: (err: string) => void) {
        return function*() {
            useButtonTextThing.style.color = 0x666666;
            useButtonTextThing.setText("loading save...");

            let useButtonBounds = useButtonTextThing.getTextWorldBounds()

            let spinner = world.addWorldObject(new Spinner(useButtonBounds.x - 10, useButtonBounds.y + 7, 1.5, 4));
            spinner.name = 'usespinner';

            let getResult = { saveResponse: <API.GetSaveResponse>undefined, err: <string>undefined, done: false };
            

            yield S.wait(2);
            
            if (getResult.err) {
                console.error('Failed to get save data:', getResult.err);
                errorCallback(getResult.err);
                return;
            }

            debug('Got save:', saveId);

            createSaveInfo(saveId, getResult.saveResponse.saveTime);
            mergeCloudSaveDataEncodedToLocal(getResult.saveResponse.saveData);

            global.theater.loadStage(CloudSaveScreen.STAGE, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
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
