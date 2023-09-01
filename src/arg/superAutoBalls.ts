namespace ARG.SuperAutoBalls {
    export function INTRO() {
        let world = ARG.Stages.BASE_INNER_STAGE(2);

        world.runScript(function*() {
            yield S.wait(0.5);

            let text = world.addWorldObject(new SpriteText({
                x: world.width/2, y: 55,
                text: "Auto Balls as\nnever seen before",
                justify: 'center',
                anchor: Vector2.CENTER,
            }));

            world.playSound('arg/sabintro1');
            world.addWorldObject(new DesktopTransitionObject('fast'));
            yield S.wait(2.5);
            text.alpha = 0.5; yield S.wait(0.25); text.alpha = 0; yield S.wait(0.25); text.alpha = 1;

            world.playSound('arg/sabintro2');
            text.setText("In glorious\n4-bit graphics");
            world.addWorldObject(new DesktopTransitionObject('fast'));
            yield S.wait(2.5);
            text.alpha = 0.5; yield S.wait(0.25); text.alpha = 0; yield S.wait(0.25); text.alpha = 1;

            world.playSound('arg/sabintro3');
            text.setText("On your\ncomputer");
            world.addWorldObject(new DesktopTransitionObject('fast'));
            yield S.wait(2.5);
            text.alpha = 0.5; yield S.wait(0.25); text.alpha = 0; yield S.wait(0.25); text.alpha = 1;

            text.removeFromWorld();
            yield S.wait(2);

            global.theater.loadStage(TITLE);
        });

        world.onTransitioned = function() {
            playMusicNoRestart('arg/computer', 1);
        }
        
        return new OverlayedStage(world);
    }

    export function TITLE() {
        let world = ARG.Stages.BASE_INNER_STAGE(2);

        world.addWorldObjects(lciDocumentToWorldObjects('arg/sabtitle'));
        let { title, play, quit, selector } = world.select.names(Sprite, 'title', 'play', 'quit', 'selector');

        let titlePos = title.getPosition();
        title.y = 55;
        play.setVisible(false);
        quit.setVisible(false);
        selector.setVisible(false);

        world.addWorldObject(new DesktopTransitionObject());
        world.runScript(function*() {
            global.game.playMusic('arg/sabtitle', 0.1);
            yield S.wait(1.5);
            yield S.tween(1, title, 'y', title.y, titlePos.y);
            title.updateCallback = function() {
                if (this.everyNSeconds(0.5)) {
                    this.alpha = 1.8 - this.alpha;
                }
            }
            yield S.wait(0.7);

            play.setVisible(true);
            quit.setVisible(true);

            play.alpha = quit.alpha = selector.alpha = 0.5;
            yield S.wait(0.3);
            play.alpha = quit.alpha = selector.alpha = 1;

            yield S.wait(0.5);
            selector.setVisible(true);
        });

        play.addModule(new Button({
            clickTint: 0x888888,
            onHover: () => {
                selector.teleport(play);
            },
            onClick: () => {
                SQUAD = [];
                global.game.playSound('arg/sabselect');
                global.theater.loadStage(GAME);
            },
        }));

        quit.addModule(new Button({
            clickTint: 0x888888,
            onHover: () => {
                selector.teleport(quit);
            },
            onClick: () => {
                global.game.playSound('arg/sabselect');
                global.theater.loadStage(ARG.Stages.DESKTOP);
            },
        }));
        
        return new OverlayedStage(world);
    }

    type SquadBall = { x: number, y: number, level: number };
    var SQUAD: SquadBall[] = [];
    export function GAME() {
        let world = ARG.Stages.BASE_INNER_STAGE(2, {
            physicsGroups: {
                'walls': { immovable: true },
                'balls': {},
            },
            collisions: [
                { move: 'balls', from: 'balls', momentumTransfer: 'elastic' },
                { move: 'balls', from: 'walls', momentumTransfer: 'elastic' },
            ],
            collisionIterations: 4,
            // TODO: why does this work?
            useRaycastDisplacementThreshold: Infinity, //4,
            maxDistancePerCollisionStep: 16,
            minDistanceIgnoreCollisionStepCalculation: 400,
        });

        world.addWorldObjects(lciDocumentToWorldObjects('arg/sabgame'));
        let { play, preppanel, fan } = world.select.names(Sprite, 'play', 'preppanel', 'fan');

        fan.updateCallback = function() {
            if (this.everyNSeconds(0.5)) this.angle += 45;
        }

        world.addWorldObject(new PhysicsWorldObject({
            physicsGroup: 'walls',
            bounds: new InvertedRectBounds(2, 2, 157, 107),
        }));
        world.addWorldObject(new PhysicsWorldObject({
            physicsGroup: 'walls',
            bounds: new CircleBounds(80, 56, 16),
        }));

        for (let squadBall of SQUAD) {
            let ball = world.addWorldObject(new ArgBall(squadBall.x, squadBall.y, 'friend'));
            ball.level = squadBall.level;
        }

        for (let pos of [vec2(96, 43), vec2(120, 43), vec2(144, 43), vec2(96, 67)]) {
            let ball = world.addWorldObject(new ArgBall(pos.x, pos.y, 'friend'));
            ball.isInShop = true;
        }

        let ballMover = world.addWorldObject(new ArgBallMover());

        preppanel.addChildKeepWorldPosition(play);
        play.addModule(new Button({
            hoverTint: 0xBBBBBB,
            clickTint: 0x888888,
            onClick: () => {
                global.game.playSound('arg/click');
                world.runScript(function*() {
                    global.game.stopMusic(1);
                    play.getModule(Button).enabled = false;
                    world.removeWorldObjects(world.select.typeAll(ArgBall).filter(ball => ball.isInShop));
                    world.removeWorldObject(ballMover);

                    SQUAD = world.select.typeAll(ArgBall).filter(ball => !ball.isInShop).map(ball => ({ x: ball.x, y: ball.y, level: ball.level }));

                    world.addWorldObjects(generateEnemySquad(world));
                    World.Actions.moveWorldObjectToFront(preppanel);

                    yield S.tween(1, preppanel, 'x', preppanel.x, preppanel.x + 100);
                    preppanel.kill();

                    for (let ball of world.select.typeAll(ArgBall)) {
                        ball.setState('battle');
                    }

                    global.game.playMusic('arg/sabbattle');

                    world.runScript(roundScript(world));
                });
            },
        }));

        world.addWorldObject(new DesktopTransitionObject());

        world.runScript(function*() {
            global.game.stopMusic();
            yield S.wait(1);
            global.game.playMusic('arg/sabshop', 0.1);
        });
        
        return new OverlayedStage(world);
    }

    export function PAUSE() {
        let world = ARG.Stages.BASE_INNER_STAGE(2);
        
        return new OverlayedStage(world);
    }

    function generateEnemySquad(world: World) {
        let balls = world.select.typeAll(ArgBall);
        let enemyBallLevels = Math.max(3, A.sum(balls, ball => ball.level));
        let enemySquad: ArgBall[] = [];
        for (let i = 0; i < enemyBallLevels; i++) {
            if (enemySquad.length < 5) {
                enemySquad.push(new ArgBall(Random.float(90, 110), Random.float(10, 96), 'enemy'));
            } else {
                Random.element(enemySquad).level++;
            }
        }
        return enemySquad;
    }

    function roundScript(world: World) {
        return function*() {
            let result: 'win' | 'lose' | 'draw';
            while (true) {
                let balls = world.select.typeAll(ArgBall);
                if (balls.length === 0) {
                    result = 'draw';
                    break;
                }
                if (balls.every(ball => ball.team === 'friend')) {
                    result = 'win';
                    break;
                }
                if (balls.every(ball => ball.team === 'enemy')) {
                    result = 'lose';
                    break;
                }
                yield;
            }

            yield S.wait(1);

            let screen = world.addWorldObject(new Sprite({
                texture: world.takeSnapshot(),
                scale: 0.5,
            }));

            global.game.stopMusic(1);
            world.volume = 0;

            let filter = new DesktopTransitionFilter();
            filter.amount = 1;
            world.effects.post.filters.push(filter);

            yield S.tween(1, filter, 'amount', 1, 0);

            screen.tint = 0x000000;
            A.removeAll(world.effects.post.filters, filter);

            yield S.wait(1);

            let resultText = world.addWorldObject(new SpriteText({
                x: world.width/2, y: 55,
                text: result === 'win' ? 'win!' : (result === 'lose' ? 'lose...' : 'draw'),
                anchor: Vector2.CENTER,
            }));

            if (result === 'win') global.game.playSound('arg/sabwin');
            if (result === 'lose') global.game.playSound('arg/sablose');

            yield S.wait(1);

            resultText.kill();

            yield S.wait(0.5);

            global.theater.loadStage(GAME);
        }
    }
}