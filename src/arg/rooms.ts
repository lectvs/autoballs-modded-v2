namespace ARG.Rooms {
    function BASE(lciDocument: string, initialPlayerDirection: Vector2) {
        let lciTextureFull = AssetCache.getTexture(lciDocument);
        let worldSize = { width: lciTextureFull.width, height: lciTextureFull.height };

        let world = new World({
            width: 160, height: 120,
            scaleX: 2, scaleY: 2,
            backgroundColor: 0x000000,
            camera: {
                mode: Camera.Mode.FOCUS(80, 60),
                movement: Camera.Movement.SNAP(),
                bounds: { left: 0, top: 0, right: worldSize.width, bottom: worldSize.height },
            },
            layers: [
                { name: ARG.Layers.ground },
                { name: ARG.Layers.onground },
                { name: ARG.Layers.main, sortKey: obj => obj.y },
                { name: ARG.Layers.fg },
            ],
            physicsGroups: {
                [ARG.PhysicsGroups.walls]: {},
                [ARG.PhysicsGroups.iwalls]: {},
                [ARG.PhysicsGroups.player]: {},
                [ARG.PhysicsGroups.boxes]: {},
            },
            collisions: [
                { move: ARG.PhysicsGroups.player, from: ARG.PhysicsGroups.walls },
                { move: ARG.PhysicsGroups.player, from: ARG.PhysicsGroups.iwalls },
                { move: ARG.PhysicsGroups.boxes, from: ARG.PhysicsGroups.walls },
                { move: ARG.PhysicsGroups.boxes, from: ARG.PhysicsGroups.iwalls },
                { move: ARG.PhysicsGroups.boxes, from: ARG.PhysicsGroups.boxes },
                { move: ARG.PhysicsGroups.player, from: ARG.PhysicsGroups.boxes },
            ],
            collisionIterations: 4,
            // TODO: why does this work?
            useRaycastDisplacementThreshold: 4,
            maxDistancePerCollisionStep: 16,
            minDistanceIgnoreCollisionStepCalculation: 400,
            globalSoundHumanizePercent: 0.1,
        });

        world.addWorldObjects(lciDocumentToWorldObjects(lciDocument));

        // Walls
        world.addWorldObject(new PhysicsWorldObject({
            physicsGroup: ARG.PhysicsGroups.walls,
            bounds: new InvertedRectBounds(0, 0, worldSize.width, worldSize.height),
            immovable: true,
        }));

        let player = world.select.type(Player);
        player.direction.set(initialPlayerDirection);

        world.camera.setModeFollow('player', 0, -8);

        return world;
    }


    /* CHAPTER 1 */

    export function LOBBY() {
        let world = BASE('arg/lobby', Vector2.DOWN);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');

            Input.preventRegularKeyboardInput = false;
        };

        world.select.name<Sprite>('lady').updateCallback = function() {
            this.z = M.lerp(-1, 1, Tween.Easing.OscillateSine(0.5)(this.life.time));
        };

        world.addWorldObject(new Warp(215, 0, 33, 20, () => ROOM1(), transition(), 'arg/scene'));

        let bec = world.select.type(Bec);
        let key = world.select.type(ArgKey);

        world.runScript(function*() {
            yield S.wait(4);

            let text = world.addWorldObject(new SpriteText({
                x: 96, y: 84,
                text: "ARROWS OR WASD\n\nWALK",
                font: 'smallnumbers',
                anchor: Vector2.CENTER,
                justify: 'center',
                layer: ARG.Layers.onground,
                alpha: 0,
            }));

            yield S.tween(2, text, 'alpha', 0, 0.5);
        });

        world.runScript(function*() {
            yield S.waitUntil(() => bec.y <= 46 && bec.x >= 216 && key.state === 'following');
            global.theater.playCutscene(ARG.Cutscenes.LOBBY_OPEN_DOOR);
        });

        return world;
    }

    export function ROOM1() {
        let world = BASE('arg/room1', Vector2.UP);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/music_light', 2);
        };

        world.addWorldObject(new Warp(158, 28, 2, 50, () => ROOM2(), transition(), 'arg/scene'));

        let securitydoor = world.select.name<Sprite>('securitydoor');
        let button1 = world.select.name<ArgButton>('button1');
        button1.onDown = () => {
            securitydoor.setVisible(false);
            securitydoor.colliding = false;
            world.playSound('arg/securitydoor');
        };
        button1.onUp = () => {
            securitydoor.setVisible(true);
            securitydoor.colliding = true;
            world.playSound('arg/securitydoor');
        };

        world.runScript(function*() {
            let text = world.addWorldObject(new SpriteText({
                x: 80, y: 184,
                text: "SPACE\n\nGRAB BOX",
                font: 'smallnumbers',
                anchor: Vector2.CENTER,
                justify: 'center',
                layer: ARG.Layers.onground,
                alpha: 0,
            }));

            yield S.tween(2, text, 'alpha', 0, 0.5);
        });

        return world;
    }

    export function ROOM2() {
        let world = BASE('arg/room2', Vector2.RIGHT);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/music_light');
        };

        world.addWorldObject(new Warp(158, 49, 2, 29, () => ROOM3(), transition(), 'arg/scene'));

        connectButtonToLaserGen(world, 'button', 'lasergen');
        connectLaserRecToGate(world, 'laserrec', 'gate');

        return world;
    }

    export function ROOM3() {
        let world = BASE('arg/room3', Vector2.RIGHT);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/music_light');
        };

        world.camera.setModeFollow('player', 0, -8, true);

        world.addWorldObject(new Warp(216, 0, 48, 32, () => HALL(), transition(), 'arg/scene'));

        connectButtonToLaserGen(world, 'buttontt', 'lasergent');
        connectButtonToGate(world, 'buttont', 'gatet');
        connectLaserRecToGate(world, 'laserrecm', 'gatem');
        connectButtonToGate(world, 'buttonm', 'gateb');
        connectButtonToLaserGen(world, 'buttond', 'lasergend');

        let bec = world.select.type(Bec);
        let laserrect = world.select.name<ArgLaserRec>('laserrect');

        world.runScript(function*() {
            yield S.waitUntil(() => bec.y < 120 && laserrect.state === 'active');
            global.theater.playCutscene(ARG.Cutscenes.ROOM3_OPEN_GATE);
        });

        return world;
    }

    export function HALL() {
        let world = BASE('arg/hall', Vector2.UP);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere', 1);
        };

        world.addWorldObject(new Warp(66, 40, 26, 4, () => END(), transition(), 'arg/scene'));

        return world;
    }

    export function END() {
        let world = BASE('arg/end', Vector2.UP);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');
        };

        let bec = world.select.type(Bec);

        world.select.name('timer').updateCallback = function() {
            this.setVisible(Tween.Easing.OscillateSine(1)(this.life.time) < 0.5);
        };

        world.runScript(function*() {
            let bounds = new RectBounds(16, 44, 38, 30);
            yield S.waitUntil(() => bounds.containsPoint(bec));
            global.theater.playCutscene(ARG.Cutscenes.END_ENTER_DOCTOR);
        });

        return world;
    }

    /* CHAPTER 2 */

    export function CONFERENCE() {
        let world = BASE('arg/conference', Vector2.RIGHT);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');

            Input.preventRegularKeyboardInput = false;
        };

        world.addWorldObject(new Warp(80, 0, 32, 8, () => RESTRICTED(), transition(), 'arg/scene'));

        let chester = world.select.type(Chester);

        world.runScript(function*() {
            yield S.wait(4);

            let text = world.addWorldObject(new SpriteText({
                x: 84, y: 212,
                text: "ARROWS OR WASD -> WALK",
                font: 'smallnumbers',
                anchor: Vector2.CENTER,
                justify: 'center',
                layer: ARG.Layers.onground,
                alpha: 0,
            }));

            yield S.tween(2, text, 'alpha', 0, 0.5);
        });

        world.runScript(function*() {
            yield S.waitUntil(() => chester.x >= 80 && chester.x <= 112 && chester.y <= 36);
            global.theater.playCutscene(ARG.Cutscenes.CONFERENCE_OPEN_BOOKSHELF);
        });

        return world;
    }

    export function RESTRICTED() {
        let world = BASE('arg/restricted', Vector2.UP);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');
        };

        world.addWorldObject(new Warp(72, 0, 24, 4, () => AREA1(), transition(), 'arg/scene'));

        return world;
    }

    export function AREA1() {
        let world = BASE('arg/area1', Vector2.UP);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');
        };

        world.addWorldObject(new Warp(312, 92, 4, 20, () => AREA2(), transition(), 'arg/scene'));

        let chester = world.select.type(Chester);

        world.addWorldObject(new Sight({
            sightPosition: vec2(220, 14),
            scientist: world.select.type(Scientist1),
            visionDown: world.select.name('vision_down'),
        }));

        world.runScript(function*() {
            yield S.waitUntil(() => chester.x >= 194);
            global.theater.playCutscene(ARG.Cutscenes.AREA1_START_SIGHT);
        });

        return world;
    }

    export function AREA2() {
        let world = BASE('arg/area2', Vector2.RIGHT);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');
        };

        world.addWorldObject(new Warp(98, 0, 24, 4, () => AREA3(), transition(), 'arg/scene'));

        connectButtonToGate(world, 'button1', 'gate1');
        connectButtonToGate(world, 'button2', 'gate2');

        world.runScript(function*() {
            let text = world.addWorldObject(new SpriteText({
                x: 110, y: 132,
                text: "SPACE\n\nGRAB BOX",
                font: 'smallnumbers',
                anchor: Vector2.CENTER,
                justify: 'center',
                layer: ARG.Layers.onground,
                alpha: 0,
            }));

            yield S.tween(2, text, 'alpha', 0, 0.5);
        });

        return world;
    }

    export function AREA3() {
        let world = BASE('arg/area3', Vector2.UP);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');
        };

        world.addWorldObject(new Warp(0, 103, 2, 33, () => AREA4(), transition(), 'arg/scene'));

        let sight = world.addWorldObject(new Sight({
            sightPosition: vec2(54, 108),
            scientist: world.select.type(Scientist2),
            visionDown: world.select.name('vision_down'),
            visionRight: world.select.name('vision_right'),
            visionUp: world.select.name('vision_up'),
        }));

        sight.start(1);

        return world;
    }

    export function AREA4() {
        let world = BASE('arg/area4', Vector2.LEFT);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');
        };

        world.addWorldObject(new Warp(29, 59, 4, 20, () => AREA5(), transition(), 'arg/scene'));

        let chester = world.select.type(Chester);

        let sight = world.addWorldObject(new Sight({
            sightPosition: vec2(200, 170),
            scientist: new NullScientist(),
            visionLeft: world.select.name('vision_left'),
        }));

        world.runScript(function*() {
            yield S.waitUntil(() => chester.y <= 156);
            sight.doSingleSight('left');
        });

        return world;
    }

    export function AREA5() {
        let world = BASE('arg/area5', Vector2.LEFT);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');
        };

        world.addWorldObject(new Warp(68, 0, 24, 6, () => HALL_BETA(), transition(), 'arg/scene'));

        let door = world.select.name<Sprite>('door');
        let button = world.select.name<ArgButton>('button');
        button.onDown = () => {
            door.setVisible(false);
            door.colliding = false;
            world.playSound('arg/securitydoor');
        };
        button.onUp = () => {
            door.setVisible(true);
            door.colliding = true;
            world.playSound('arg/securitydoor');
        };

        let sight = world.addWorldObject(new Sight({
            sightPosition: vec2(80, 109),
            scientist: world.select.type(Scientist3),
            visionLeft: world.select.name('vision_left'),
            visionDown: world.select.name('vision_down'),
            visionRight: world.select.name('vision_right'),
            visionUp: world.select.name('vision_up'),
        }));

        sight.start(2.5);

        return world;
    }

    export function HALL_BETA() {
        let world = BASE('arg/hallbeta', Vector2.UP);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');
        };

        world.addWorldObject(new Warp(37, 44, 26, 2, () => LAB(), transition(), 'arg/scene'));

        return world;
    }

    export function LAB() {
        let world = BASE('arg/lab', Vector2.UP);

        world.onTransitioned = () => {
            global.game.musicManager.playMusic('arg/atmosphere');
        };

        world.select.name('vat_broken').setVisible(false);

        world.select.name('screen').updateCallback = function() {
            this.setVisible(Tween.Easing.OscillateSine(1)(this.life.time) > 0.5);
        }

        world.select.name('light').updateCallback = function() {
            this.setVisible(Tween.Easing.OscillateSine(2)(this.life.time) > 0.5);
        }

        world.select.name<Sprite>('beta').updateCallback = function() {
            this.offsetY = M.lerp(-23, -24, Tween.Easing.OscillateSine(0.6)(this.life.time));
        }

        world.addWorldObject(new BubbleMaker(79, 51, 1));
        world.addWorldObject(new BubbleMaker(101, 51, -1));

        let chester = world.select.type(Chester);

        world.runScript(function*() {
            yield S.wait(10);
            yield S.waitUntil(() => chester.x < 84);
            global.theater.playCutscene(ARG.Cutscenes.LAB_START_HIDE);
        });

        return world;
    }

    function connectButtonToGate(world: World, buttonName: string, gateName: string) {
        let button = world.select.name<ArgButton>(buttonName);
        let gate = world.select.name<ArgGateV | ArgGateH>(gateName);
        button.onDown = () => {
            gate.open();
        };
        button.onUp = () => {
            gate.close();
        };
    }

    function connectButtonToLaserGen(world: World, buttonName: string, laserGenName: string) {
        let button = world.select.name<ArgButton>(buttonName);
        let laserGen = world.select.name<ArgLaserGen>(laserGenName);
        button.onDown = () => {
            laserGen.enable();
        };
        button.onUp = () => {
            laserGen.disable();
        };
    }

    function connectLaserRecToGate(world: World, laserRecName: string, gateName: string) {
        let laserRec = world.select.name<ArgLaserRec>(laserRecName);
        let gate = world.select.name<ArgGateV | ArgGateH>(gateName);
        laserRec.onActive = () => {
            gate.open();
        };
        laserRec.onInactive = () => {
            gate.close();
        };
    }

    export function transition() {
        return new Transitions.Curtains({ inTime: 0.2, midTime: 1, outTime: 0.5 });
    }
}