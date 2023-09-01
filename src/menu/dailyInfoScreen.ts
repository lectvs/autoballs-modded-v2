namespace DailyInfoScreen {
    export function STAGE() {
        let world = new World({
            backgroundColor: 0x000000,
            volume: 0,
            allowPause: false,
        });

        setArenaWorld(Arenas.ARENA_FIRST);
        world.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));
        
        world.addWorldObjects(lciDocumentToWorldObjects('dailyinfomenu'));

        world.select.name<Sprite>('title').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time-1) * 2;
        };

        world.select.name<Sprite>('back').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+2) * 3;
        };
        world.select.name('back').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                global.theater.loadStage(DailyScreen.STAGE);
            },
        }));

        world.addWorldObject(new WorldObject({
            update: function() {
                if (Input.justDown(Input.GAME_CLOSE_MENU) && this.life.frames > 1 && world.select.name('back').getModule(Button).enabled) {
                    Input.consume(Input.GAME_CLOSE_MENU);
                    global.theater.loadStage(DailyScreen.STAGE);
                }
            }
        }));

        world.onTransitioned = () => {
            global.game.playMusic('music/title');
            loadPage(world, 'info');
        };

        return world;
    }

    function loadPage(world: World, page: 'info' | 'schedule') {
        world.runScript(function*() {
            let box = world.select.name<Sprite>('box');

            World.Actions.removeWorldObjectsFromWorld(box.children);

            let textx = -108;
            let texty = -78;

            if (page === 'info') {
                box.addChild(new SpriteText({
                    x: textx, y: texty,
                    text: "Welcome to Dailies!",
                }));
    
                box.addChild(new SpriteText({
                    x: textx, y: texty + 23,
                    text: "- Everyone faces the same\nopponents and has the same\nshop choices each day",
                }));
    
                box.addChild(new SpriteText({
                    x: textx, y: texty + 76,
                    text: "- You only get one shot!",
                }));
    
                box.addChild(new SpriteText({
                    x: textx, y: texty + 99,
                    text: "- All balls/items are\nunlocked during dailies",
                }));
    
                box.addChild(new MenuTextButton({
                    x: 0, y: 72,
                    text: "Schedule >",
                    anchor: Vector2.CENTER,
                    style: { color: 0xFFD800 },
                    hoverColor: Color.lerpColorByRgb(0xFFD800, 0x000000, 0.5),
                    onClick: () => {
                        global.game.playSound('click');
                        loadPage(world, 'schedule');
                    },
                }));
            } else if (page === 'schedule') {
                box.addChild(new SpriteText({
                    x: textx, y: texty,
                    text: "Daily Schedule",
                }));

                box.addChild(new SpriteText({
                    x: textx, y: texty + 23,
                    text: LiveVersion.DAILY_SCHEDULE.join('\n'),
                }));
    
                box.addChild(new MenuTextButton({
                    x: 0, y: 72,
                    text: "Back >",
                    anchor: Vector2.CENTER,
                    style: { color: 0xFFD800 },
                    hoverColor: Color.lerpColorByRgb(0xFFD800, 0x000000, 0.5),
                    onClick: () => {
                        global.game.playSound('click');
                        global.theater.loadStage(DailyScreen.STAGE);
                    },
                }));
            }
        });
    }
}
