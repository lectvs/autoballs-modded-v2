
namespace ARG.Stages {
    export function KEYPAD() {
        let world = new World({
            width: 160, height: 120,
            scaleX: 2, scaleY: 2,
            backgroundColor: 0x000000,
        });

        world.onTransitioned = () => {
            global.game.playMusic('arg/atmosphere', 2);
        };

        let keypad = world.addWorldObject(new Sprite({ texture: 'arg/keypad' }));
        keypad.alpha = 0;

        let currentCode = "";
        let codeVerifier = world.addWorldObject(new CodeVerifier(() => currentCode));

        world.runScript(function*() {
            yield S.doOverTime(4, t => {
                keypad.alpha = M.lerp(0, 1, t);
            });

            keypad.kill();
            let keypadObjs = world.addWorldObjects(lciDocumentToWorldObjects('arg/keypad'));

            world.addWorldObject(new SpriteText({
                name: 'codetext',
                x: 99, y: 28,
                anchor: Vector2.TOP_RIGHT,
                update: function() {
                    this.setText(currentCode);
                }
            }));

            let mainMenuButton = world.select.name<Sprite>('mainmenu');
            mainMenuButton.setVisible(true);
            mainMenuButton.alpha = 0;

            for (let obj of keypadObjs) {
                if (obj.name.startsWith('button')) {
                    let value = obj.name.substring(6);

                    obj.addModule(new Button({
                        hoverTint: 0xBBBBBB,
                        clickTint: 0x888888,
                        onClick: () => {
                            world.playSound('typename');
                            if (value === 'enter') {
                                if (codeVerifier.verify()) {
                                    world.runScript(codeSuccess(world));
                                } else {
                                    world.runScript(codeError(world, () => currentCode = ""));
                                }
                                return;
                            }

                            if (currentCode.length >= 4 || value.length !== 1) {
                                return;
                            }

                            currentCode += value;
                        }
                    }));
                }
            }
        });

        world.runScript(function*() {
            yield S.wait(15);

            let text1 = world.addWorldObject(new SpriteText({
                x: 28, y: world.height/2,
                text: "WHAT WAS THE CODE AGAIN?",
                font: 'smallnumbers',
                anchor: Vector2.CENTER,
                justify: 'center',
                maxWidth: 48,
                alpha: 0,
            }));

            yield S.tween(2, text1, 'alpha', 0, 0.5);

            yield S.wait(2);

            let text2 = world.addWorldObject(new SpriteText({
                x: world.width - 28, y: world.height/2,
                text: "IT HAD SOMETHING TO DO WITH THE BALLMANAC...",
                font: 'smallnumbers',
                anchor: Vector2.CENTER,
                justify: 'center',
                maxWidth: 48,
                alpha: 0,
            }));

            yield S.tween(2, text2, 'alpha', 0, 0.5);

            yield S.wait(4);
            
            let mainMenuButton = world.select.name<Sprite>('mainmenu');
            mainMenuButton.addModule(new Button({
                hoverTint: 0xBBBBBB,
                clickTint: 0x888888,
                onClick: () => {
                    world.playSound('click');
                    global.game.loadMainMenu();
                }
            }));

            yield S.tween(2, mainMenuButton, 'alpha', 0, 1);
        });

        return world;
    }

    function codeSuccess(world: World) {
        return function*() {
            world.select.modules(Button).forEach(b => b.enabled = false);

            global.game.stopMusic();
            world.playSound('buff');
            world.playSound('levelup');

            world.runScript(function*() {
                world.effects.addSilhouette.color = 0xFFFFFF;
                yield S.tween(0.2, world.effects.silhouette, 'amount', 1, 0);
                world.effects.silhouette.enabled = false;
            });

            yield S.loopFor(50, i => function*() {
                world.select.name<SpriteText>('codetext').style.color = i%2 === 0 ? 0x00FF00 : 0xFFFFFF;
                yield S.wait(0.05);
            });

            global.theater.loadStage(ARG.Stages.LOGIN, new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 }));
        }
    }

    function codeError(world: World, reset: () => void) {
        return function*() {
            world.select.modules(Button).forEach(b => b.enabled = false);
            world.effects.post.filters.push(new TextureFilters.Tint(0xFF0000));
            world.effects.post.filters.push(new Effects.Filters.Glitch(20, 0, 2));
            
            world.playSound('error');
            yield S.wait(0.5);

            reset();

            world.effects.post.filters.pop();
            world.effects.post.filters.pop();
            world.select.modules(Button).forEach(b => b.enabled = true);
        }
    }

    class CodeVerifier extends WorldObject {
        constructor(private getCode: () => string) {
            super();
        }

        verify() {
            return this.getCode() === '0621';
        }
    }
}