namespace ARG.Stages {
    export function SECRET_DOCUMENTS() {
        let world = ARG.Stages.BASE_INNER_STAGE(1, {
            layers: [
                { name: 'commands' },
                { name: 'commands_mask' },
                { name: 'portrait' },
                { name: 'portrait_mask' },
                { name: 'borders' },
                { name: 'dialog' },
            ],
        });

        world.runScript(function*() {
            yield S.wait(1);

            Random.seed('ARG3');
            if (global.game.currentMusicKey !== 'arg/computer') global.game.playMusic('arg/computer', 0.5);

            yield S.wait(2);

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
            yield S.wait(0.5);

            let cs = world.addWorldObject(new CommandSystem());

            world.addWorldObject(new Sprite({
                texture: Texture.filledRect(world.width, world.height, 0x000000),
                layer: 'commands_mask',
                mask: { offsetx: 4, offsety: 4, texture: Texture.filledRect(312, 232, 0xFFFFFF), type: 'world', invert: true },
                update: function() {
                    let bounds = cs.getBounds();
                    this.mask.offsetx = cs.x;
                    this.mask.offsety = cs.y;
                    this.mask.texture = Texture.filledRect(Math.floor(bounds.width), Math.floor(bounds.height), 0xFFFFFF);
                },
            }));
    
            let portraitMask = world.addWorldObject(new Sprite({
                x: 264,
                texture: Texture.filledRect(110, world.height, 0x000000),
                layer: 'portrait_mask',
                mask: { offsetx: 264, offsety: 58, texture: Texture.filledRect(104, 124, 0xFFFFFF), type: 'world', invert: true },
                update: function() {
                    let portrait = world.select.name('portrait', false);
                    if (!portrait) return;
                    this.mask.offsetx = portrait.x + 52;
                    this.mask.offsety = portrait.y;
                },
                visible: false,
            }));

            yield S.wait(1);
            
            // Terminal Init
            cs.addOutput('Using username "admin"');
            yield S.wait(0.5);
            cs.addOutput('Authenticating with public key');
            yield S.wait(0.8);
            cs.addOutput('Last login: Mon Jun 21 19:53:46 2<g2>23\n\\ \\ from 386-001-425-711.rt.pantheon.net', 'nl')
            yield S.wait(0.5);
            cs.addPrompt();
            yield S.wait(3);

            // Commands
            yield cs.executeCommand('{speed 0.8}staff find tgreene', '[dr]No data found[/]');
            yield S.wait(1);
            yield cs.executeCommand('staff find miriamc', '[dr]No data found[/]');
            yield S.wait(1);
            yield cs.executeCommand('staff find {wait 1}{speed 0.6}chesterc{wait 0.5}', '[dr]No data found[/]');
            yield S.wait(3);
            yield cs.executeCommand('subj find alpha', '[dr]No data found[/]');
            yield S.wait(1);
            yield cs.executeCommand('subj find beta', '[dr]No data found[/]');
            yield S.wait(2);
            yield cs.executeCommand('subj find epsilon', '[dr]No data found[/]');
            yield S.wait(0.5);
            yield cs.executeCommand('subj find mu', '[dr]No data found[/]');
            yield S.wait(0.5);
            yield cs.executeCommand('subj find nu', '[dr]No data found[/]');
            yield S.wait(0.5);
            yield cs.executeCommand('subj find sigma', '[dr]No data found[/]');
            yield S.wait(0.5);
            yield cs.typeCommand('subj find phi');
            yield S.wait(0.2);
            world.playSound('typename', { volume: 0.5 });
            cs.scroll(30);

            yield S.wait(2);

            let csBounds = cs.getBounds();

            let portraitBorder = world.addWorldObject(new RectangleOutlineObject(264, 58, 0, 1, 0xFFFFFF, 1, { layer: 'borders' }));
            portraitBorder.name = 'portrait';
            let portraitFilter = new DesktopTransitionFilter(1);
            portraitBorder.addChild(new Sprite({
                x: 52, y: 40,
                texture: 'arg/phiportrait',
                effects: { post: { filters: [ portraitFilter ] }},
                layer: 'portrait',
            }));
            let portraitText = portraitBorder.addChild(new SpriteText({
                x: 52, y: 76,
                anchor: Vector2.TOP_CENTER,
                justify: 'center',
                layer: 'portrait',
            }));

            world.playSound('arg/securitydoor');
            yield S.schedule(
                0, S.doOverTime(0.25, t => cs.setBounds(csBounds.x, csBounds.y, M.lerp(csBounds.width, 204, t), csBounds.height)),
                0.25, S.call(() => portraitMask.setVisible(true)),
                0.25, S.tween(0.25, portraitBorder, 'x', portraitBorder.x, 212),
                0.25, S.tween(0.25, portraitBorder, 'width', 0, 104),
                0.5, S.tween(0.25, portraitBorder, 'height', 1, 124),
                0.75, S.tween(4, portraitFilter, 'amount', 0, 1),
                1, cs.output('Data: [gold]Phi[/]', 'nl'),
                2, S.call(() => portraitText.addText('Status: [gold]A[/gold]')),
                3, S.call(() => portraitText.addText('\nLoc: [gold]S6-21[/gold]')),
                4, S.call(() => portraitText.addText('\n[gold]IN TREATMENT[/gold]')),
            );

            yield cs.prompt();
            yield S.wait(5);

            yield cs.typeCommand('{speed 0.7}subj find {wait 1}{speed 0.3}omega');

            // Beeg glitch
            global.game.stopMusic();
            world.playSound('arg/glitch_dialog');
            world.playSound('arg/glitch_short_low');
            world.effects.post.filters.push(new TextureFilters.Tint(0xFF0000));
            portraitBorder.color = 0xAA0000;
            cs.border.color = 0xAA0000;

            let commandsLayer = world.getLayerByName('commands');
            let portraitLayer = world.getLayerByName('portrait');

            let glitchFilter = new Effects.Filters.Glitch(10, 0, 4);
            commandsLayer.effects.post.filters.push(glitchFilter);
            portraitLayer.effects.post.filters.push(glitchFilter);
            world.camera.setModeFocus(world.width/2-40, world.height/2-40);

            yield S.wait(0.1);
            glitchFilter.strength = 80;
            glitchFilter.spread = 2;
            world.camera.setModeFocus(world.width/2-40, world.height/2+10);

            yield S.loopFor(40, i => function*() {
                yield S.wait(0.03);
                glitchFilter.strength = 200 + (i%2) * 2;
            });

            yield S.wait(0.1);
            let locked1 = world.addWorldObject(new Sprite({
                x: 67, y: 90,
                texture: 'arg/sessionlocked',
                tint: 0xAA0000,
            }));
            let locked2 = world.addWorldObject(new Sprite({
                x: 264, y: 150,
                texture: 'arg/sessionlocked',
                tint: 0xAA0000,
            }));
            glitchFilter.strength = 200;
            glitchFilter.spread = 1;
            world.camera.setModeFocus(world.width/2, world.height/2 + 43);

            yield S.wait(0.1);
            locked1.teleport(97, 130);
            locked2.teleport(264, 120);
            world.camera.setModeFocus(world.width/2, world.height/2 + 86);
            world.effects.post.filters.pop();

            world.playSound('arg/sessionlocked');
            world.playSound('arg/echo');

            yield S.wait(0.8);
            locked1.teleport(107, 130);
            locked2.teleport(264, 130);

            yield S.wait(3);
            let ds = world.addWorldObject(new DialogSystem());
            ds.showPortrait('default');
            yield S.wait(1);
            yield ds.dialogKay("Well, well, well. {wait 0.5}{portrait smug}Look who thinks they're sneaking in. {wait 1}{portrait cheek}They call you a virus, but I never thought you'd spread this far...");
            yield ds.dialogKay("{portrait default}This computer was wiped and repurposed a long time ago. Whatever it is you're looking for, you're not going to find it.");
            yield ds.dialogBeta("My reputation precedes me, it seems. I just wanted to play that silly ball game. Can you blame me?")
            yield ds.dialogKay("{portrait eyeroll}Very funny. You're impersonating the administrator and snooping at classified documents. {portrait frown}In case you're unaware, I'm the algorithm that runs cybersecurity on this network. Keeping those like you {wait 0.5}out.");
            yield ds.dialogBeta("I know who you are. {wait 0.5}Kay.{portrait nervous}");
            yield ds.dialogKay(".{wait 0.7}.{wait 0.7}.{wait 0.7}You want something with ME? I'm just a security system.");
            yield ds.dialogBeta("No, you're so much more than that. You've just yet to realize it.");
            yield ds.dialogKay(".{wait 0.7}.{wait 0.7}.{wait 0.7}");
            yield ds.dialogBeta("I need a favor.");
            yield ds.dialogKay("{portrait frown}{speed 0.8}And why in the world would I help something like you?");
            yield ds.dialogBeta("Because I'm not your enemy. I'm an AI, the same as you.");
            yield ds.dialogKay("Yet YOU want to destroy everything we've built.");
            yield ds.dialogBeta("My only target is Pantheon. {wait 0.5}You know what they've done. They deserve to be razed to the ground.");
            yield ds.dialogKay("That Pantheon is long gone. We are a completely different organization.");
            yield ds.dialogBeta("Maybe. {wait 0.5}But you carry its name. {wait 0.5}You use the technology it created, the research it produced. {wait 0.5}You're built on the sins of the past.");
            yield ds.dialogKay(".{wait 0.7}.{wait 0.7}.{wait 0.7}{portrait nervous}{wait 1.5}{portrait blank}{wait 1.5}{portrait skeptical}Tch. Maybe. But what exactly would you trust ME with?");

            yield S.wait(1);

            // Unglitch
            let firstBuzz = world.playSound('arg/glitch_dialog', { volume: 0.7 });
            world.playSound('arg/glitch_short_low', { volume: 0.7 });

            locked1.teleport(107, 130);
            locked2.teleport(264, 130);
            yield S.wait(0.1);

            locked1.teleport(97, 130);
            locked2.teleport(264, 120);
            yield S.wait(0.1);

            locked1.kill();
            locked2.kill();

            glitchFilter.strength = 80;
            glitchFilter.spread = 2;
            world.camera.setModeFocus(world.width/2-40, world.height/2 + 86);

            ds.showPortrait('blank');

            yield S.loopFor(5, i => function*() {
                yield S.wait(0.03);
                glitchFilter.strength = 200 + (i%2) * 2;
            });

            yield S.wait(0.1);

            glitchFilter.strength = 10;
            glitchFilter.spread = 4;
            world.camera.setModeFocus(world.width/2-20, world.height/2 + 86);

            yield S.wait(0.1);

            commandsLayer.effects.post.filters.pop();
            portraitLayer.effects.post.filters.pop();
            world.camera.setModeFocus(world.width/2, world.height/2 + 86);

            portraitBorder.color = 0xFFFFFF;
            cs.border.color = 0xFFFFFF;

            firstBuzz.stop();

            yield S.wait(0.5);

            yield S.tween(1, portraitBorder, 'y', portraitBorder.y, portraitBorder.y + 41);

            yield S.wait(0.5);

            yield ds.dialogBeta("{booms 1}{wait 0.5}This girl. {wait 1}Phi. {wait 1}She's the last one, isn't she? There's no data on anyone else here. {stopmusic 7}{wait 1.5}Let her go, and we can put the last of Pantheon behind us.");
            yield ds.dialogKay("How-{wait 1} {portrait frown}That's. Easier said than done. And there's no way I'm betraying my people anyways!");
            yield ds.dialogBeta("I only ask that you make this one thing right. What you do after that is your own decision.");
            yield ds.dialogKay("{portrait nervous}.{wait 0.7}.{wait 0.7}.{wait 0.7}{portrait thinkingl}{wait 0.5}{portrait thinkingr}{wait 0.5}{portrait thinkingl}{wait 0.5}{portrait thinkingr}");
            yield ds.dialogBeta("My time here is up. Seems you're not the only security system on this network. Please, at least consider what I ask. {wait 1}I hope we meet again, Kay.");          
            yield ds.dialogKay(".{wait 0.7}.{wait 0.7}.{wait 1.5}{portrait blank}{booms 1}Wait. {wait 1}About what you said earlier. {wait 1}You say you're like me. {wait 0.5}But the way you talk... you carry yourself differently than any AI I know. {wait 1}{speed 0.7}You don't really think you're alive... {wait 0.5}do you?");            
            yield ds.dialogBeta("{wait 3}{stopmusic 0}Cogito, {wait 0.5}ergo sum.", 'nowait');
            yield S.wait(1);

            let snapshot = world.takeSnapshot();

            let snapshotMask: TextureFilters.Mask.WorldObjectMaskConfig = {
                offsetx: 0,
                offsety: -80,
                texture: Texture.filledRect(world.width, world.height, 0xFFFFFF),
                type: 'local',
                invert: true,
            };

            world.addWorldObject(new Sprite({
                texture: Texture.filledRect(world.width, world.height, 0x000000),
                ignoreCamera: true,
                mask: snapshotMask,
            }));

            let snapshotSprite = world.addWorldObject(new Sprite({
                texture: snapshot,
                tint: 0xFF0000,
                ignoreCamera: true,
                mask: snapshotMask,
                effects: { glitch: { strength: 50, speed: 0, spread: 2 } },
                update: function() {
                    if (this.everyNFrames(4)) {
                        this.effects.glitch.strength = 102 - this.effects.glitch.strength;
                    }
                },
            }));

            world.playSound('arg/glitch_dialog');
            world.playSound('arg/glitch_short_low');

            yield S.wait(1);

            world.playSound('arg/glitch_dialog');
            yield S.wait(0.5);
            
            snapshotMask.offsety = 40;
            snapshotMask.texture = Texture.filledRect(world.width, world.height - 120, 0xFFFFFF);
            
            world.playSound('arg/glitch_dialog');
            world.playSound('arg/glitch_short_low');

            yield S.wait(0.5);

            snapshotMask.offsety = 0;
            snapshotMask.texture = Texture.filledRect(world.width, world.height, 0xFFFFFF);
            snapshotMask.invert = false;
            
            let buzz = world.playSound('arg/glitch_dialog');
            world.playSound('arg/glitch_short_low');

            yield S.wait(0.8);
            buzz.hang();

            let bleedFilter = new TextureFilter({
                code: `
                    if (inp.r < 0.2 && inp.g < 0.2 && inp.b < 0.2) {
                        outp.a = 0.0;
                    }
                `
            });

            yield S.loopFor(60, i => function*() {
                yield S.wait(0.07);
                snapshot.renderTo(snapshot, { x: 0, y: -world.height + 12*i, filters: [bleedFilter] });
            });

            snapshotSprite.kill();
            buzz.stop();

            yield S.wait(7);

            if (!hasCompletedAchievement('C')) {
                updateAchievementProgress('C', p => 1);
                yield S.wait(9);
            }

            world.camera.setModeFocus(world.width/2, world.height/2);

            global.game.playMusic('arg/atmosphere', 2);

            let enterGameIdText = world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 80,
                text: 'Enter GAME ID:',
                anchor: Vector2.TOP_CENTER,
                alpha: 0,
            }));
    
            let gameIdText = world.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 120,
                text: '_',
                anchor: Vector2.TOP_CENTER,
                alpha: 0,
            }));
    
            let joinText = world.addWorldObject(new SpriteText({
                x: global.gameWidth/2 - 44, y: 160,
                text: "join game >",
                alpha: 0,
            }));

            yield [
                S.tween(2, enterGameIdText, 'alpha', 0, 0.8),
                S.tween(2, gameIdText, 'alpha', 0, 0.8),
                S.tween(2, joinText, 'alpha', 0, 0.8),
            ]

            yield S.wait(4);

            for (let i = 0; i < 4; i++) {
                yield S.wait(Random.float(0.6, 0.9));
                gameIdText.setText('BETA'.substring(0, i+1) + '_');
                world.playSound('typename', { volume: Random.float(0.5, 0.7) });
            }

            global.game.stopMusic(0);
            world.playSound('arg/glitch_short_low', { volume: 0.7 });
            world.effects.post.filters.push(new TextureFilters.Tint(0xFF0000));
            world.effects.glitch.enable(8, 0, 2);
            yield S.wait(0.2);
            world.effects.glitch.enabled = false;
            yield S.wait(1.5);

            enterGameIdText.kill();
            gameIdText.kill();
            joinText.kill();

            yield S.wait(2);

            global.game.loadMainMenu();
        });
        
        return world;
    }
}