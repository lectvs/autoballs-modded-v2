namespace EnterYourName {
    const MAX_NAME_LENGTH = 14;

    const lectvsNameMessages = [
        "(Hey, that's my name!)",
        "(Come on, as the dev, I should get\nmy own name reserved, right?)",
        "(Seriously? It's MY name.\nNot YOUR name.)",
        "(How else will people know they're\nplaying against me??)",
        "(...  :|)",
        "(...  :|)",
        "(...  :|)",
        "(... >:|)",
        "(...fine. you can play as \"lectvs\"...)",
        "(...but you'd better build a good\nsquad for me! >:])",
    ];

    export function STAGE(source: 'mainmenu' | 'playscreen') {
        let world = new World();

        let enterYourNameY = IS_MOBILE ? 28 : 80;
        let nameTextY = IS_MOBILE ? 68 : 120;
    
        world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: enterYourNameY,
            text: 'Enter your name:',
            anchor: Vector2.TOP_CENTER,
        }));

        let enteredName = '';

        let nameText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: nameTextY,
            text: '_',
            anchor: Vector2.TOP_CENTER,
            update: function() {
                if (this.life.time > 0.1) updateChars(typeChar);
            },
        }));

        if (IS_MOBILE) {
            world.addWorldObject(new Keyboard(global.gameWidth/2, 160, typeChar, 'full'));
        } else {
            world.addWorldObject(new MenuTextButton({
                x: global.gameWidth/2, y: 160,
                text: "that's me! >",
                anchor: Vector2.TOP_CENTER,
                onClick: () => {
                    submitName();
                }
            }));
        }

        let reservedTimes = 0;
        let blankClicks = 0;
        let errorText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 212,
            text: '',
            anchor: Vector2.CENTER,
            justify: 'center',
            style: { color: 0x0094FF },
        }));

        world.onTransitioned = function() {
            global.game.stopMusic();
            Input.preventRegularKeyboardInput = true;
            let name = loadName();
            if (name) {
                enteredName = name;
                nameText.setText(`${St.replaceAll(enteredName, ' ', '\\ ')}_`);
            }
        }

        function submitName() {
            global.game.playSound('click');
            if (enteredName.length === 0) {
                blankClicks++;
                if (blankClicks < 4) return;
                enteredName = 'Guest';
            }

            if (enteredName.trim() === 'lectvs' && reservedTimes < lectvsNameMessages.length && !IS_MOBILE && !Input.isKeyCodeDown('Shift')) {
                resetWithError(lectvsNameMessages[reservedTimes]);
                reservedTimes++;
                return;
            }

            if (enteredName.trim() === '69' && !IS_MOBILE) {
                resetWithError('(Nice.)');
                return;
            }

            saveName(enteredName);
            Input.preventRegularKeyboardInput = false;
            global.theater.loadStage(PlayScreen.STAGE, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
        }

        function typeChar(char: string) {
            if (char === 'Backspace') {
                if (enteredName.length > 0) {
                    enteredName = enteredName.substring(0, enteredName.length-1);
                    global.game.playSound('typename');
                }
            } else if (char === 'Enter') {
                submitName();
            } else if (char === 'Escape') {
                back();
            } else {
                if (enteredName.length < MAX_NAME_LENGTH) {
                    enteredName += char;
                    global.game.playSound('typename');
                }
            }
            nameText.setText(`${St.replaceAll(enteredName, ' ', '\\ ')}_`);
        }
        
        function resetWithError(error: string) {
            errorText.setText(error);
            enteredName = '';
            nameText.setText('_');
        }

        function back() {
            Input.preventRegularKeyboardInput = false;
            if (source === 'mainmenu') {
                global.game.loadMainMenu();
            } else if (source === 'playscreen') {
                global.theater.loadStage(PlayScreen.STAGE);
            }
        }
    
        return world;
    }

    function updateChars(callback: (char: string) => void) {
        for (let char in CHARS_DOWN) {
            let oldDown = CHARS_DOWN[char];
            let newDown = Input.isKeyCodeDown(char);
            if (newDown && !oldDown) {
                if (Input.isKeyCodeDown('Shift') && char.length === 1) {
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
        '0': false, '1': false, '2': false, '3': false, '4': false, '5': false, '6': false, '7': false, '8': false, '9': false, ' ': false,
        'Backspace': false, 'Enter': false, 'Escape': false,
    };
}
