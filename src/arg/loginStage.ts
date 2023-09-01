namespace ARG.Stages {
    export function LOGIN() {
        let world = ARG.Stages.BASE_INNER_STAGE(1);

        world.addWorldObjects(lciDocumentToWorldObjects('arg/login'));
        let userpass = world.select.name<Sprite>('userpass');

        userpass.setVisible(false);

        let username = world.addWorldObject(new SpriteText({
            name: 'username',
            x: userpass.x + 11, y: userpass.y - 20,
            text: 'admin',
        }));
        username.visibleCharCount = 0;

        let password = world.addWorldObject(new SpriteText({
            x: userpass.x + 11, y: userpass.y + 8,
            text: '****',
        }));
        password.visibleCharCount = 0;

        world.runScript(function*() {
            yield S.wait(2);

            Random.seed('ARG3');
            global.game.playMusic('arg/computer', 0.5);

            // Initiating remote connection
            let initiatingRemoteConnectionText = "Initiating remote connection";
            let initiatingRemoteConnection = world.addWorldObject(new SpriteText({
                x: world.width/2, y: world.height/2,
                anchor: Vector2.CENTER,
            }));

            for (let i = 0; i < 3; i++) {
                initiatingRemoteConnection.setText(initiatingRemoteConnectionText + '.');
                yield S.wait(0.5);
                initiatingRemoteConnection.setText(initiatingRemoteConnectionText + '..');
                yield S.wait(0.5);
                initiatingRemoteConnection.setText(initiatingRemoteConnectionText + '...');
                yield S.wait(0.5);
            }

            initiatingRemoteConnection.kill();
            yield S.wait(1);

            // Login
            userpass.setVisible(true);
            world.addWorldObject(new DesktopTransitionObject());
            yield S.wait(1);

            yield S.wait(1);

            for (let i = 0; i < 5; i++) {
                username.visibleCharCount++;
                world.playSound('typename');
                yield S.wait(Random.float(0.1, 0.25));
            }

            yield S.wait(0.5);

            yield typePassword(password, 1, 'wrong');
            yield S.wait(2);

            let n = 6;
            for (let i = 0; i < 50; i++) {
                let speed = i <= n ? 1/M.mapClamp(i, 0, n, 1, 1/8)
                                   : M.mapClamp(i, n+1, 20, 8, 40);
                yield typePassword(password, speed, 'wrong');
                yield S.wait(0.5 / speed);
            }

            yield typePassword(password, 40, 'right');

            yield S.wait(2);

            let filter = new DesktopTransitionFilter();
            filter.amount = 1;

            world.effects.post.filters.push(filter);
            yield S.tween(1, filter, 'amount', 1, 0);

            yield S.wait(1);

            global.theater.loadStage(ARG.Stages.DESKTOP);
        });

        return world;
    }

    function typePassword(password: SpriteText, speed: number, result: 'wrong' | 'right') {
        return function*() {
            let world = password.world;

            for (let i = 0; i < 4; i++) {
                password.visibleCharCount++;
                world.playSound('typename');
                yield S.wait(Random.float(0.1, 0.25) / speed);
            }

            yield S.wait(0.3 / speed);

            world.playSound('typename', { volume: 0.5 });

            if (result === 'wrong') {
                password.visibleCharCount = 0;
                yield [
                    flashWorldRed(world, 0.5 / speed),
                    glitch(world, 0.5 / speed),
                ];
            }

            if (result === 'right') {
                world.effects.pre.filters.push(new TextureFilters.Tint(0x00FF00));
                world.playSound('buff', { volume: 1.5 });
                world.playSound('levelup', { volume: 1.5 });

                world.select.name('userpass').kill();
                world.select.name('username').kill();
                password.kill();

                world.addWorldObject(new SpriteText({
                    x: world.width/2, y: world.height/2,
                    text: 'Login successful!\n\nWelcome, Administrator!',
                    anchor: Vector2.CENTER,
                    justify: 'center',
                }));

                world.effects.addSilhouette.color = 0xFFFFFF;
                yield S.tween(0.3, world.effects.silhouette, 'amount', 1, 0);
            }
        }
    }

    function flashWorldRed(world: World, time: number) {
        return function*() {
            let filter = new TextureFilters.Tint(0xFF0000);
            world.effects.pre.filters.push(filter);
            yield S.wait(time);
            A.removeAll(world.effects.pre.filters, filter);
        }
    }

    function glitch(world: World, time: number) {
        return function*() {
            let filter = new Effects.Filters.Glitch(8, 0.5, 8);
            filter.setUniform('t', Random.float(0, 10));
            world.effects.pre.filters.push(filter);
            world.playSound('arg/glitch_short_low');
            yield S.wait(time);
            A.removeAll(world.effects.pre.filters, filter);
        }
    }
}