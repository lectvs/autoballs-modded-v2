namespace PackScreen {
    export function STAGE(isChallengeMode: boolean) {
        let world = new World({
            backgroundColor: 0x000000,
            volume: 0,
            allowPause: false,
        });

        setArenaWorld(Arenas.ARENA_FIRST);
        world.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));
        
        world.addWorldObjects(lciDocumentToWorldObjects('packmenu'));

        world.select.name<Sprite>('title').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time-1) * 2;
        };

        let classic = world.select.name<Sprite>('classic');
        classic.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onClick: () => {
                global.game.playSound('click');
                startNewGame(Arenas.ARENA_FIRST, ['classic'], undefined, [], isChallengeMode, undefined);
            },
        }));
        classic.data.infoBoxDescription = "The classic Auto Balls\nexperience!";

        classic.addChild(new Sprite({
            x: 0, y: 8,
            texture: 'buffbeams',
            scale: 116/128,
            vangle: 40,
        }));
        classic.addChild(newBallWorld(-120/2, -144/2, 'classic'));

        let classicWins = loadWins('classic');
        if (classicWins > 0) {
            classic.addChild(new SpriteText({
                x: -53, y: 71,
                text: `[offsetx -2]<crown>[/]${classicWins}`,
                style: { color: 0xFFD800 },
                anchor: Vector2.BOTTOM_LEFT,
            }));
        }

        World.Actions.moveWorldObjectToFront(classic);

        let community = world.select.name<Sprite>('community');
        community.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onClick: () => {
                global.game.playSound('click');
                startNewGame(Arenas.ARENA_FIRST, ['community'], undefined, [], isChallengeMode, undefined);
            },
        }));
        community.data.infoBoxDescription = "A brand new pack of\nballs suggested by\nthe community!";

        community.addChild(new Sprite({
            x: 0, y: 8,
            texture: 'buffbeams',
            scale: 116/128,
            vangle: 40,
        }));

        community.addChild(newBallWorld(-120/2, -144/2, 'community'));

        let communityWins = loadWins('community');
        if (communityWins > 0) {
            community.addChild(new SpriteText({
                x: 56, y: 71,
                text: `[offsetx -2]<crown>[/]${communityWins}`,
                style: { color: 0xFFD800 },
                anchor: Vector2.BOTTOM_RIGHT,
            }));
        }

        World.Actions.moveWorldObjectToFront(community);

        let shuffle = world.select.name<Sprite>('shuffle');
        shuffle.bounds = new CircleBounds(0, 0, 33, shuffle);
        World.Actions.moveWorldObjectToFront(shuffle);

        let shuffleText = shuffle.addChild(new SpriteText({
            x: 0, y: 18,
            text: '',
            font: 'smallnumbers',
            anchor: Vector2.TOP_CENTER,
        }));

        let shuffleButton = shuffle.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onClick: () => {
                global.game.playSound('click');
                startNewGame(Arenas.ARENA_FIRST, ['weekly'], { week: Weekly.LIVE_WEEK }, [], isChallengeMode, undefined);
            },
            onHover: () => {
                shuffleText.style.color = 0xFFFF00;
            },
            onUnhover: () => {
                shuffleText.style.color = 0xFFFFFF;
            },
            onClickedDown: () => {
                shuffleText.style.color = 0xBBBB00;
            },
            priority: 1,
            enabled: false,
        }));
        shuffle.data.infoBoxDescription = "A mix of both packs\nthat changes every week!";

        let shuffleHide = world.addWorldObject(new Sprite({
            x: shuffle.x, y: shuffle.y + 6,
            texture: new AnchoredTexture(Texture.filledRect(36, 36, 0x000000), 0.5, 0.5),
        }));

        shuffleHide.addChild(new Spinner(0, 0, 3, 10));

        Weekly.load({
            onSuccess() {
                shuffleHide.kill();
                shuffleButton.enabled = true;
                shuffleText.setText(`WEEK ${Weekly.LIVE_WEEK}`);
            },
            onError() {
                // Nothing, just let the spinner spin indefinitely.
            },
        });

        let wires = world.select.name<Sprite>('wires');
        World.Actions.moveWorldObjectToFront(wires);

        let weeklyWins = loadWins('weekly');
        let shufflewins = world.select.name<Sprite>('shufflewins');
        if (weeklyWins > 0) {
            World.Actions.moveWorldObjectToFront(shufflewins);
            shufflewins.addChild(new SpriteText({
                y: 2,
                text: `<crown2l><crown2r>${weeklyWins}`,
                font: 'smallnumbers',
                style: { color: 0xFFDB00 },
                anchor: Vector2.CENTER,
            }));
        } else {
            shufflewins.setVisible(false);
        }


        let shuffleinfo = world.select.name<Sprite>('shuffleinfo');
        shuffleinfo.bounds = new CircleBounds(0, 0, 8, shuffleinfo);
        shuffleinfo.addModule(new Button({
            hoverTint: 0xBBBBBB,
            clickTint: 0x888888,
            onClick: () => {
                global.game.playSound('click');
                global.game.menuSystem.loadMenu(() => new AlmanacMenu('weekly'));
            },
            priority: 2,
        }));
        World.Actions.moveWorldObjectToFront(shuffleinfo);

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

    export function startNewGame(arena: string, packs: Pack[], weekly: { week: number }, modifiers: string[], isChallengeMode: boolean, daily: API.Daily) {
        resetData();
        GAME_DATA.squad.name = loadName() ?? 'Guest';
        GAME_DATA.arena = arena;
        GAME_DATA.packs = packs;
        GAME_DATA.modifiers = modifiers;
        GAME_DATA.weekly = weekly;
        let gameData: MatchmakingGameData = {
            gameData: GAME_DATA,
            state: 'startshop',
            lock: gameDataLock(),
        };

        if (daily) {
            PlayScreen.startDailyGame(gameData, daily);
        } else if (isChallengeMode) {
            PlayScreen.startChallengeModeGame(gameData);
        } else {
            PlayScreen.startMatchmakingGame(gameData);
        }
    }

    function newBallWorld(x: number, y: number, pack: Pack) {
        let validBallTypes = VALID_SQUAD_BALL_TYPES[pack].filter(type => isBallTypeUnlocked(type));
        let ball = squadBallToWorldBall({
            x: x, y: y,
            properties: {
                type: Random.element(validBallTypes),
                damage: 1,
                health: 1,
                level: 1,
                equipment: -1,
                metadata: {},
            },
        }, undefined, -1, 'friend');
        ball.changeHighlight(true);

        let scale = 4;

        let world = new World({
            width: 120/scale,
            height: 144/scale,
            scaleX: scale,
            scaleY: scale,
            backgroundAlpha: 0,
            layers: [
                { name: Battle.Layers.balls },
            ],
            physicsGroups: {
                [Battle.PhysicsGroups.balls]: {},
            },
        });

        ball.x = world.width/2;
        ball.y = world.height/2 + 8/scale;
        world.addWorldObject(ball);

        world.addWorldObject(new AbilitySystem());

        let wawo = new Theater.WorldAsWorldObject(world);
        wawo.x = x;
        wawo.y = y;

        return wawo;
    }

    const VALID_SQUAD_BALL_TYPES = {
        'classic': [
            2, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 17,
            18, 19, 22, 24, 27, 29, 30, 32, 33, 35,
            36, 37, 38, 39, 40, 43, 44, 45, 46, 47,
            48, 49, 50, 51,
        ],
        'community': [
            101, 102, 105, 106, 107, 109, 110, 111, 112, 117,
            119, 120, 122, 123, 124, 137, 139, 140, 141, 143,
            144,
        ],
        'weekly': [
            0,
        ],
    };
}