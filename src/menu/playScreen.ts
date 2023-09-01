namespace PlayScreen {
    export function STAGE() {
        let world = new World({
            backgroundColor: 0x000000,
            volume: 0,
            allowPause: false,
        });

        setArenaWorld(Arenas.ARENA_FIRST);
        world.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));
        
        world.addWorldObjects(lciDocumentToWorldObjects('playmenu'));

        world.select.name<Sprite>('play').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time-1) * 2;
        };

        let playerName = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2 + 8, y: 55,
            text: loadName(),
            anchor: Vector2.CENTER,
            justify: 'center',
            effects: { outline: { color: 0x000000 }, post: { filters: [new DropShadowFilter()] }},
        }));

        let playerNameGear = world.addWorldObject(new Sprite({
            x: playerName.x - playerName.getTextWidth()/2 - 9,
            y: playerName.y - 1,
            texture: 'gearsmall',
            bounds: new CircleBounds(0, 0, 7),
        }));
        playerNameGear.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(2),
            onClick: () => {
                global.game.playSound('click');
                global.game.startGame(() => EnterYourName.STAGE('playscreen'));
            },
        }));

        let daily = world.select.name<Sprite>('daily');
        daily.updateCallback = function() {
            this.angle = Math.sin(2*this.life.time-1) * 3;
        };
        if (API.BETA || IS_MODDED) {
            daily.tint = 0x666666;
            
        }

        let mm = world.select.name<Sprite>('mm');
        mm.updateCallback = function() {
            this.angle = Math.sin(2*this.life.time) * 3;
        };
        mm.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                world.runScript(playMatchmakingScript(world));
            },
        }));
        mm.data.infoBoxDescription = "The classic Auto Balls\nexperience!";

        let mmasterisk = world.select.name<Sprite>('mmasterisk');
        let mmasteriskd = mmasterisk.getPosition().subtract(mm);
        if (loadMatchmakingGameData()) {
            mmasterisk.updateCallback = function() {
                let d = mmasteriskd.rotated(mm.angle * 0.85);
                this.x = mm.x + d.x;
                this.y = mm.y + d.y;
            }
        } else {
            mmasterisk.removeFromWorld();
        }

        let challenge = world.select.name<Sprite>('challenge');
        challenge.updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+1) * 2;
        };
        challenge.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                world.runScript(playChallengeModeScript(world));
            },
        }));
        challenge.data.infoBoxDescription = "Test your skill against\n[gold][offsetx -3]<crown>[/offsetx][/gold]Winning squads!";

        
        let challengeasterisk = world.select.name<Sprite>('challengeasterisk');
        let challengeasteriskd = challengeasterisk.getPosition().subtract(challenge);
        if (loadChallengeModeGameData()) {
            challengeasterisk.updateCallback = function() {
                let d = challengeasteriskd.rotated(challenge.angle * 0.85);
                this.x = challenge.x + d.x;
                this.y = challenge.y + d.y;
            }
        } else {
            challengeasterisk.removeFromWorld();
        }

        let vs = world.select.name<Sprite>('vs');
        vs.updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+2) * 2;
        };
        vs.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                GAME_MODE = 'vs';
                global.theater.loadStage(() => VSModeScreen.STAGE(loadVsSettings()));
            },
        }));
        vs.data.infoBoxDescription = "Play 1-on-1 against a friend!";

        world.select.name<Sprite>('back').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+2) * 3;
        };
        world.select.name('back').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                global.game.loadMainMenu()
            },
        }));

        world.addWorldObject(new BoundsInfoBox(Vector2.BOTTOM_CENTER, 0.5));

        world.addWorldObject(new WorldObject({
            update: function() {
                if (Input.justDown(Input.GAME_CLOSE_MENU) && this.life.frames > 1 && world.select.name('back').getModule(Button).enabled) {
                    Input.consume(Input.GAME_CLOSE_MENU);
                    global.game.loadMainMenu();
                }
            }
        }));

        world.onTransitioned = () => {
            global.game.playMusic('music/title');
        };

        return world;
    }

    function playMatchmakingScript(world: World) {
        return function*() {
            let gameData = loadMatchmakingGameData();

            if (gameData) {
                let enabledButtons = world.select.modules(Button).filter(button => button.enabled);
                for (let button of enabledButtons) {
                    button.enabled = false;
                }

                let infoBox = world.select.type(BoundsInfoBox);
                infoBox.enabled = false;

                let warningBox = world.addWorldObject(new PlayWarningBox());

                yield S.waitUntil(() => warningBox.result);

                if (warningBox.result === 'cancel') {
                    for (let button of enabledButtons) {
                        button.enabled = true;
                    }
                    infoBox.enabled = true;
                    return;
                }

                if (warningBox.result === 'loadgame') {
                    startMatchmakingGame(gameData);
                    return;
                }
            }

            global.theater.loadStage(() => PackScreen.STAGE(false));
        }
    }

    function playChallengeModeScript(world: World) {
        return function*() {
            let gameData = loadChallengeModeGameData();

            if (gameData) {
                let enabledButtons = world.select.modules(Button).filter(button => button.enabled);
                for (let button of enabledButtons) {
                    button.enabled = false;
                }

                let infoBox = world.select.type(BoundsInfoBox);
                infoBox.enabled = false;

                let warningBox = world.addWorldObject(new PlayWarningBox());
                
                yield S.waitUntil(() => warningBox.result);

                if (warningBox.result === 'cancel') {
                    for (let button of enabledButtons) {
                        button.enabled = true;
                    }
                    infoBox.enabled = true;
                    return;
                }

                if (warningBox.result === 'loadgame') {
                    startChallengeModeGame(gameData);
                    return;
                }
            }

            global.theater.loadStage(() => PackScreen.STAGE(true));
        }
    }

    export function startMatchmakingGame(gameData: MatchmakingGameData) {
        GAME_MODE = 'mm';
        global.game.stopMusic(0.5);
        GameFragments.startMatchmakingGame(gameData, false, undefined);
    }

    export function startChallengeModeGame(gameData: MatchmakingGameData) {
        GAME_MODE = 'mm';
        global.game.stopMusic(0.5);
        GameFragments.startMatchmakingGame(gameData, true, undefined);
    }

    export function startDailyGame(gameData: MatchmakingGameData, daily: API.Daily) {
        GAME_MODE = 'mm';
        gameData.gameData.availableBallTypes = getAvailableBallTypesAll();
        gameData.gameData.availableItemTypes = getAvailableItemTypesAll();
        global.game.stopMusic(0.5);
        GameFragments.startMatchmakingGame(gameData, _.contains(daily.modifiers, 'challengemode'), daily);
    }

    class PlayWarningBox extends Sprite {
        private static PADDING = 6;
        private static BUTTON_D = 18;
    
        private text: SpriteText;

        private loadGameButton: MenuTextButton;
        private newGameButton: MenuTextButton;
        private cancelButton: MenuTextButton;

        result: 'loadgame' | 'newgame' | 'cancel';
    
        constructor(text: string = undefined, maxWidth: number = 200) {
            super({
                x: global.gameWidth/2, y: global.gameHeight/2,
            });
    
            this.text = this.addChild(new SpriteText({
                text: text,
                maxWidth: maxWidth,
                anchor: Vector2.TOP,
                justify: 'center',
                copyFromParent: ['layer'],
            }));

            let width = text ? this.text.getTextWidth() + 2*PlayWarningBox.PADDING : 112 + 2*PlayWarningBox.PADDING;
            let height = text ? this.text.getTextHeight() + 2*PlayWarningBox.PADDING + 30 : 16 + 2*PlayWarningBox.BUTTON_D + 2*PlayWarningBox.PADDING;

            this.setTexture(InfoBox.getTextureForSize(width, height));
            this.text.localy = -height/2 + PlayWarningBox.PADDING;

            this.loadGameButton = this.addChild(new MenuTextButton({
                x: 0, y: height/2 - PlayWarningBox.PADDING - 2*PlayWarningBox.BUTTON_D,
                text: "Continue Game",
                anchor: Vector2.BOTTOM_CENTER,
                copyFromParent: ['layer'],
                onClick: () => {
                    global.game.playSound('click');
                    this.result = 'loadgame';
                    this.kill();
                }
            }));

            let areYouSure = false;
            this.newGameButton = this.addChild(new MenuTextButton({
                x: 0, y: height/2 - PlayWarningBox.PADDING - PlayWarningBox.BUTTON_D,
                text: "New Game",
                anchor: Vector2.BOTTOM_CENTER,
                copyFromParent: ['layer'],
                onClick: () => {
                    global.game.playSound('click');

                    if (!areYouSure) {
                        areYouSure = true;
                        this.newGameButton.setText("Are You Sure?");
                    } else {
                        this.result = 'newgame';
                        this.kill();
                    }
                }
            }));
    
            this.cancelButton = this.addChild(new MenuTextButton({
                x: 0, y: height/2 - PlayWarningBox.PADDING,
                text: "Cancel",
                anchor: Vector2.BOTTOM_CENTER,
                copyFromParent: ['layer'],
                onClick: () => {
                    global.game.playSound('click');
                    this.result = 'cancel';
                    this.kill();
                }
            }));
        }

        update() {
            super.update();

            if (Input.justDown(Input.GAME_CLOSE_MENU)) {
                Input.consume(Input.GAME_CLOSE_MENU);
                this.result = 'cancel';
                this.kill();
            }
        }
    
        postUpdate() {
            super.postUpdate();
    
            World.Actions.orderWorldObjectAfter(this.text, this);
            World.Actions.orderWorldObjectAfter(this.loadGameButton, this);
            World.Actions.orderWorldObjectAfter(this.newGameButton, this);
            World.Actions.orderWorldObjectAfter(this.cancelButton, this);
        }
    }
}