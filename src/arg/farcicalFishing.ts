namespace ARG.FarcicalFishing {
    export function GAME() {
        let world = ARG.Stages.BASE_INNER_STAGE(2);

        world.data.score = 0;

        world.addWorldObjects(lciDocumentToWorldObjects('arg/ffgame'));
        let { title, play, quit, selector, static, fisher, wolf } = world.select.names(Sprite, 'title', 'play', 'quit', 'selector', 'static', 'fisher', 'wolf');

        fisher.updateCallback = function() {
            if (this.everyNSeconds(1)) {
                this.offsetY = 1 - this.offsetY;
            }
        }

        static.effects.pre.filters.push(new StaticFilter(0xFFFFFF, 1));

        play.setVisible(false);
        quit.setVisible(false);
        selector.setVisible(false);

        wolf.setVisible(false);

        world.runScript(function*() {
            global.game.playMusic('arg/ff', 0.1);
            world.addWorldObject(new DesktopTransitionObject());
            yield S.wait(1);

            title.updateCallback = function() {
                if (this.everyNSeconds(0.5)) {
                    this.alpha = 1.8 - this.alpha;
                }
            }
            yield S.wait(0.5);

            play.setVisible(true);
            quit.setVisible(true);

            play.alpha = quit.alpha = selector.alpha = 0.5;
            yield S.wait(0.3);
            play.alpha = quit.alpha = selector.alpha = 1;

            yield S.wait(0.5);
            selector.setVisible(true);

            play.addModule(new Button({
                clickTint: 0x888888,
                onHover: () => {
                    selector.teleport(play);
                },
                onClick: () => {
                    global.game.playSound('arg/sabselect');
                    world.runScript(gameLoop(world));
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
        });

        let fishData: [number, number, number][] = [
            [64, 220, 60],
            [20, 290, 30],
            [100, 300, 30],
            [90, 370, 40],
            [50, 465, 75],
            [5, 545, 25],
            [125, 705, 30],
            [10, 765, 140],
            [130, 890, 20],
            [85, 1000, 70],
            [20, 1065, 15],
            [137, 1205, 20],
            [5, 1260, 20],
            [115, 1345, 25],
            [5, 1345, 55],
            [10, 1420, 25],
            [10, 1490, 105],
            [60, 1570, 25],
        ];

        for (let fd of fishData) {
            world.addWorldObject(new ArgFish(fd[0], fd[1], fd[2]));
        }

        return new OverlayedStage(world);
    }

    function gameLoop(world: World) {
        return function*() {
            let { title, play, quit, selector, fisher, wolf } = world.select.names(Sprite, 'title', 'play', 'quit', 'selector', 'fisher', 'wolf');

            play.getModule(Button).enabled = false;
            quit.getModule(Button).enabled = false;

            let camera = vec2(world.camera);
            world.camera.setModeFollow(camera);

            // Start
            yield S.tween(1, camera, 'y', camera.y, camera.y + 120, Tween.Easing.InOutQuad);

            title.setVisible(false);
            play.setVisible(false);
            quit.setVisible(false);
            selector.setVisible(false);

            fisher.setVisible(false);
            wolf.setVisible(true);
            let wolfChar = world.addWorldObject(new Wolf(24, 86));
            World.Actions.orderWorldObjectBefore(wolfChar, wolf);

            let hook = world.addWorldObject(new ArgHook(world.width/2, 112));

            yield S.tween(1, hook, 'y', hook.y, 150, Tween.Easing.OutQuad);

            hook.setState('idle');
            yield S.waitUntil(() => hook.state === 'moving');

            // Game
            let cameraSpeed = 15;
            let result: 'win' | 'lose';
            while (true) {
                camera.y += cameraSpeed * world.delta;
                cameraSpeed += 0.5 * world.delta;

                if (hook.state === 'dying' || hook.state === 'dead') {
                    result = 'lose';
                    break;
                }
                
                if (camera.y >= 2010) {
                    camera.y = 2010;
                    result = 'win';
                    break;
                }

                yield;
            }

            // End
            if (result === 'lose') {
                for (let i = 0; i < world.data.score; i++) {
                    world.addWorldObject(new Sprite({
                        x: 60, y: 82 - 6*i,
                        texture: 'arg/fishdead',
                    }));
                }

                world.addWorldObject(new SpriteText({
                    x: 114, y: 64,
                    text: `Caught ${world.data.score}`,
                    anchor: Vector2.CENTER,
                }));

                yield S.waitUntil(() => hook.state === 'dead');

                yield S.wait(0.4);

                yield S.tween(1, camera, 'y', camera.y, 80, Tween.Easing.InQuad);

                yield S.wait(3);

                let filter = new DesktopTransitionFilter();
                filter.amount = 1;
                world.effects.post.filters.push(filter);
                yield S.tween(1, filter, 'amount', 1, 0);

                yield S.wait(1);

                global.theater.loadStage(GAME);
            }

            if (result === 'win') {
                global.game.musicManager.currentMusic?.hang();

                world.addWorldObject(new Sprite({
                    texture: world.takeSnapshot(),
                    scale: 0.5,
                    ignoreCamera: true,
                }));

                world.addWorldObject(new Sprite({
                    x: world.width/2-5, y: world.height/2,
                    texture: 'arg/softwareerror',
                    ignoreCamera: true,
                }));

                hook.kill();
            }
        }
    }
}