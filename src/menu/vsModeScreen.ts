namespace VSModeScreen {
    export function STAGE(settings: VSModeSettings.Settings) {
        let world = new World({
            backgroundColor: 0x000000,
            volume: 0,
            allowPause: false,
        });

        setArenaWorld(settings.arena);
        world.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));
        
        world.addWorldObjects(lciDocumentToWorldObjects('vsmodemenu'));

        world.select.name<Sprite>('versusmode').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time-1) * 2;
        };

        world.select.name<Sprite>('create').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time) * 3;
        };
        world.select.name('create').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                world.runScript(createVsGame(world, settings));
            },
        }));

        world.select.name('settings').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onClick: () => {
                global.game.playSound('click');
                global.theater.loadStage(VSModeSettings.STAGE);
            },
        }));

        if (_.isEqual(settings, VSModeSettings.GET_DEFAULT_SETTINGS())) {
            world.select.name('changedsettings').setVisible(false);
        }

        world.select.name<Sprite>('join').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+1) * 3;
        };
        world.select.name('join').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                global.theater.loadStage(EnterGameCode.STAGE_VERSUS);
            },
        }));

        world.select.name<Sprite>('spectate').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+2) * 3;
        };
        world.select.name('spectate').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                global.theater.loadStage(EnterGameCode.STAGE_SPECTATE);
            },
        }));

        let lastVsGame = loadVersusModeGameData({ type: 'last' });
        if (lastVsGame) {
            world.addWorldObject(new MenuTextButton({
                x: global.gameWidth/2, y: 180,
                text: `(current game: ${lastVsGame.gameData.gameId})`,
                anchor: Vector2.TOP_CENTER,
                effects: { outline: { color: 0x000000 }},

                hoverColor: 0xFFFF00,
                onJustHovered: function() {
                    juiceObject(this, 0.5);
                },
                onClick:  () => {
                    global.game.playSound('click');
                    global.theater.loadStage(EnterGameCode.STAGE_VERSUS);
                },
            }));
        }

        world.select.name<Sprite>('back').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+2) * 3;
        };
        world.select.name('back').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                global.theater.loadStage(PlayScreen.STAGE);
            },
        }));

        world.addWorldObject(new WorldObject({
            update: function() {
                if (Input.justDown(Input.GAME_CLOSE_MENU) && this.life.frames > 1 && world.select.name('back').getModule(Button).enabled) {
                    Input.consume(Input.GAME_CLOSE_MENU);
                    global.theater.loadStage(PlayScreen.STAGE);
                }
            }
        }));

        world.onTransitioned = () => {
            global.game.playMusic('music/title');
        };

        return world;
    }
}