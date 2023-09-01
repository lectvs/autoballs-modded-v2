namespace ARG.Cutscenes {
    export const BEGIN_ARG: Cutscene = {
        script: function*() {
            global.world.addWorldObject(new Sprite({ texture: global.world.takeSnapshot() }));
            global.world.effects.post.filters.push(new Effects.Filters.Glitch(60, 0, 30));

            global.theater.playSound('shake');
            global.game.stopMusic();

            let sound = global.theater.playSound('arg/glitch_dialog');
            yield S.wait(0.5);
            sound.hang();
            yield S.wait(6.5);
            sound.stop();
            
            yield S.fadeOut(0);

            global.theater.loadStage(() => new World());

            yield S.wait(5);

            yield typeText("Are you still playing\nthat silly ball game?", global.theater.width/2, global.theater.height/2 - 15, 0xFFFFFF, 20, 'arg/spark', 3);
            yield typeText("You should let someone\nelse have a turn.", global.theater.width/2, global.theater.height/2 - 15, 0xFFFFFF, 20, 'arg/spark', 3);
            yield typeText("This is stupid.", global.theater.width/2, global.theater.height - 28, 0xFFFF00, 20, 'arg/bip', 1.5);

            global.theater.playSound('shake', { humanized: false });
            global.theater.loadStage(ARG.Rooms.LOBBY);
        }
    }

    export const LOBBY_OPEN_DOOR: Cutscene = {
        script: function*() {
            let bec = global.world.select.type(Bec);
            let key = global.world.select.type(ArgKey);
            let door = global.world.select.name<Sprite>('door');

            if (bec.x < 240) yield S.moveToX(bec, 240);

            bec.flipX = false;
            bec.direction.set(0, -1);
            yield S.schedule(
                0, S.playAnimation(bec, 'reach'),
                1, function*() {
                    key.setState('free');
                    key.layer = World.DEFAULT_LAYER;
                    yield S.tweenPt(1, key, key, vec2(243, 25), Tween.Easing.InOutQuad);
                },
                2, S.tween(0.5, key, 'alpha', 1, 0),
            );

            global.world.playSound('shake', { humanized: false });
            door.kill();
            key.kill();
        }
    }

    export const ROOM3_OPEN_GATE: Cutscene = {
        script: function*() {
            let bec = global.world.select.type(Bec);
            let biggatel = global.world.select.name<Sprite>('biggatel');
            let biggater = global.world.select.name<Sprite>('biggater');

            let mask: TextureFilters.Mask.WorldObjectMaskConfig = {
                offsetx: 216,
                offsety: 10,
                texture: Texture.filledRect(48, 53, 0xFFFFFF),
                type: 'world',
            };
            biggatel.mask = mask;
            biggater.mask = mask;

            yield S.moveTo(bec, Math.min(bec.x, 258), Math.min(bec.y, 115));
            bec.direction.set(0, -1);

            global.game.musicManager.stopMusic(1);
            yield S.wait(1.5);

            yield S.schedule(
                0, S.shake(1, 6),
                0, S.loopFor(24, i => S.chain(S.call(() => global.world.playSound('shake')), S.wait(0.25))),
                1, S.tween(4, biggatel, 'x', biggatel.x, biggatel.x-22),
                1, S.tween(4, biggater, 'x', biggater.x, biggater.x+22),
            );

            yield S.wait(1);
            global.game.musicManager.playMusic('arg/atmosphere', 1);
        }
    }

    export const END_ENTER_DOCTOR: Cutscene = {
        script: function*() {
            let bec = global.world.select.type(Bec);

            yield S.moveToY(bec, 72);
            yield S.wait(0.1);
            if (bec.x < 30 || bec.x > 46) yield S.moveToX(bec, 38);
            bec.direction.set(0, -1);

            global.game.musicManager.stopMusic(2);
            yield S.wait(2);

            let doctor = global.world.addWorldObject(new Doctor(80, 160));
            doctor.physicsGroup = undefined;

            yield S.moveToY(doctor, 98);
            yield S.wait(0.1);
            yield S.moveToX(doctor, 37);
            yield S.wait(0.1);
            yield S.moveToY(doctor, 80);

            let screenshot = global.world.addWorldObject(new Sprite({ texture: global.world.takeSnapshot(), scale: 0.5 }));

            global.world.effects.post.filters.push(new Effects.Filters.Glitch(30, 1, 30));

            let sound = global.theater.playSound('arg/glitch_dialog');
            sound.volume = 0.7;
            sound.loop = true;
            yield S.wait(1);
            yield S.wait(0.9);
            sound.stop();

            yield S.fadeOut(0);
            
            let g = new Effects.Filters.Glitch(128, 4, 2);
            let text = global.theater.addWorldObject(new SpriteText({
                x: global.theater.width/2, y: global.theater.height/2,
                text: "That is far enough, child.",
                anchor: Vector2.CENTER,
                style: { color: 0xFFFFFF },
                effects: { post: { filters: [g] }},
            }));

            text.visibleCharCount = 0;
            yield S.loopFor(text.getCharList().length, i => function*() {
                yield* S.wait(0.05)();
                text.visibleCharCount++;
                global.theater.playSound('arg/tear');
            });

            global.theater.playSound('arg/riser');

            yield tweenGlitchPower(g, 0);
            yield S.wait(2.5);
            yield tweenGlitchPower(g, 1);
            text.setText("You were not supposed to see this.");
            text.visibleCharCount = 0;
            yield S.loopFor(text.getCharList().length, i => function*() {
                yield* S.wait(0.05)();
                text.visibleCharCount++;
                global.theater.playSound('arg/tear');
            });
            yield tweenGlitchPower(g, 0);
            yield S.wait(2.5);
            yield tweenGlitchPower(g, 1);

            text.setText("Come with me, now");
            text.style.color = 0xFF0000;
            text.visibleCharCount = 0;
            g.strength = 0;

            bec.setVisible(false);
            doctor.setVisible(false);
            screenshot.setVisible(false);
            global.world.effects.post.filters.push(new TextureFilters.Tint(0xFF0000));
            yield S.fadeSlides(0);
            global.theater.playSound('shake');
            yield S.wait(1);
            yield S.fadeOut(0);
            global.theater.playSound('shake');

            yield S.loopFor(text.getCharList().length, i => function*() {
                yield* S.wait(0.15)();
                text.visibleCharCount++;
                global.theater.playSound('arg/tear');
            });

            yield S.wait(2);
            text.kill();
            global.theater.playSound('arg/echo');

            yield S.wait(7);

            if (!hasCompletedAchievement('ArgPart1')) {
                updateAchievementProgress('ArgPart1', p => 1);
                yield S.wait(9);
            }

            global.theater.loadStage(ARG.Stages.KEYPAD);
        }
    }

    export const BEGIN_ARG_2: Cutscene = {
        script: function*() {
            yield S.fadeOut(0);
            global.theater.playSound('shake', { humanized: false });
            global.game.stopMusic();
            global.theater.loadStage(() => new World());
            yield S.wait(5);

            yield typeText("My esteemed colleague,", global.theater.width/2, global.theater.height/2 - 7, 0xFFFFFF, 20, 'arg/spark', 3);
            yield typeText("This is the third time I've\ncaught your [lb]son[/lb] wandering\nin restricted areas.", global.theater.width/2, global.theater.height/2 - 22, 0xFFFFFF, 20, 'arg/spark', 3);
            yield typeText("I understand your...\npeculiar circumstances,\nbut...", global.theater.width/2, global.theater.height/2 - 22, 0xFFFFFF, 20, 'arg/spark', 3);
            yield typeText("If he must stay here, please\nconfine him to your office.", global.theater.width/2, global.theater.height/2 - 15, 0xFFFFFF, 20, 'arg/spark', 3);
            yield typeText("This is not a daycare.", global.theater.width/2, global.theater.height/2 - 7, 0xFFFFFF, 20, 'arg/spark', 3);

            global.theater.playSound('shake', { humanized: false });
            global.theater.loadStage(ARG.Rooms.CONFERENCE);
        }
    }

    export const CONFERENCE_OPEN_BOOKSHELF: Cutscene = {
        script: function*() {
            let chester = global.world.select.type(Chester);
            let bookshelf = global.world.select.name('bookshelf');

            yield S.moveTo(chester, 87, 36);
            chester.direction.set(0, -1);
            yield S.wait(0.3);
            global.world.playSound('arg/pressureplate');
            yield S.wait(1);
            yield S.moveToY(chester, 58);
            chester.direction.set(0, -1);

            yield S.wait(0.1);

            let slide = global.world.playSound('arg/box_slide');
            slide.speed = 0.7;
            slide.loop = true;
            yield S.tween(2, bookshelf, 'y', bookshelf.y, bookshelf.y + 11);
            yield S.tween(3, bookshelf, 'x', bookshelf.x, bookshelf.x - 32);
            slide.stop();
        }
    }

    export const AREA1_START_SIGHT: Cutscene = {
        script: function*() {
            let sight = global.world.select.type(Sight);
            let chester = global.world.select.type(Chester);

            global.game.musicManager.stopMusic(1);

            chester.direction.set(0, 1);
            sight.doSingleSight('down');
            yield S.wait(4);
            sight.start(1);
            chester.direction.set(1, 0);
        }
    }

    export const AREA4_SIGHT: Cutscene = {
        script: function*() {
            let sight = global.world.select.type(Sight);
            let chester = global.world.select.type(Chester);

            global.game.musicManager.stopMusic(1);

            chester.direction.set(0, 1);
            sight.doSingleSight('left');
            yield S.wait(3);
            chester.direction.set(0, -1);
        }
    }

    export const CHESTER_DIE: Cutscene = {
        script: function*() {
            let sight = global.world.select.type(Sight);
            sight.stop();

            let chester = global.world.select.type(Chester);
            let slice = new TextureFilters.Slice(rect(0, 0, 24, 24));
            chester.effects.post.filters.push(slice);
            chester.direction.x = 1;
            chester.playAnimation('die', true);
            chester.updateCallback = function() {
                this.offsetX = M.lerp(0, 1, Tween.Easing.OscillateSine(3)(this.life.time));
            }
            chester.addTimer(0.35, () => chester.world.playSound('shake'), 8).time = 0.2;

            yield S.wait(1.5);
            yield S.doOverTime(1.5, t => slice.setSlice(rect(0, 0, 24, M.lerp(24, 0, t))));
            yield S.wait(1);

            global.theater.reloadCurrentStage(ARG.Rooms.transition());
        }
    }

    export const LAB_START_HIDE: Cutscene = {
        script: function*() {
            global.world.playSound('shake', { humanized: false });
            global.game.playMusic('arg/arg');

            flash();

            let walkScript = global.world.runScript(function*() {
                while (true) {
                    yield S.wait(1);
                    let walk = global.world.playSound('arg/walk');
                    walk.speed = 0.8;
                    walk.volume = 2;
                }
            });

            let zoom = new ZoomFilter(vec2(160, 120), 0);
            global.world.effects.post.filters.push(zoom);
            let zoomShake = global.world.runScript(function*() {
                while (true) {
                    zoom.amount = Random.float(-0.1, 0.1);
                    yield;
                }
            });

            yield S.wait(1.5);

            let hideScript = global.world.runScript(function*() {
                let hidePositions = new RandomNumberGenerator(379).shuffle([vec2(26, 68), vec2(27, 98), vec2(45, 78), vec2(46, 107), vec2(59, 63), vec2(64, 89),
                                        vec2(83, 78), vec2(104, 67), vec2(124, 55), vec2(134, 66), vec2(129, 84), vec2(132, 42)]);
                let i = 0;
                while (true) {
                    yield S.wait(0.5);
                    global.world.runScript(hideText(hidePositions[i].x, hidePositions[i].y));
                    i = (i + 1) % hidePositions.length;
                }
            });

            let chester = global.world.select.type(Chester);
            chester.walkVolume = 0.2;

            global.world.runScript(function*() {
                yield S.wait(2);
                yield S.waitUntil(() => chester.x > 116 && chester.x < 142 && chester.y < 40);
                walkScript.stop();
                hideScript.stop();
                zoomShake.stop();
                A.removeAll(global.world.effects.post.filters, zoom);
                global.theater.playCutscene(ARG.Cutscenes.LAB_ENTER_DOCTOR);
            });
        }
    }

    export const LAB_ENTER_DOCTOR: Cutscene = {
        script: function*() {
            global.game.stopMusic(0.5);

            let chester = global.world.select.type(Chester);
            let cabinet = global.world.select.type(Cabinet);

            yield S.moveToX(chester, 129);
            chester.direction.set(0, -1); yield S.wait(0.2);
            cabinet.colliding = false;
            cabinet.open();
            yield S.tween(0.1, chester, 'y', chester.y, chester.y+8);
            yield S.wait(1);
            yield S.moveToY(chester, 33); yield S.wait(0.5);
            chester.direction.set(0, 1); yield S.wait(0.5);
            chester.kill();
            cabinet.close();

            yield S.wait(2);

            let doctor = global.world.addWorldObject(new Doctor(43, 160));
            doctor.physicsGroup = undefined;

            yield S.moveToY(doctor, 58);
            yield S.wait(0.4);
            yield S.loopFor(20, i => S.chain(
                S.wait(i <= 5 ? Random.float(0.2, 0.5) : Random.float(0.1, 0.2)),
                S.call(() => global.world.playSound('typename').speed = Random.float(0.72, 0.88)),
            ));

            flash();
            global.world.playSound('shake', { humanized: false }).volume = 0.5;
            doctor.direction.set(1, 0);
            yield [
                S.shake(2, 0.2),
                S.jumpZ(0.2, doctor, 4, true),
            ];

            yield S.wait(2);

            doctor.running = true;
            yield S.moveToY(doctor, 66);
            yield S.moveToX(doctor, 90);
            doctor.direction.set(0, -1);
            yield S.wait(1);
            yield S.moveToY(doctor, 80);
            yield S.moveToX(doctor, 43);
            yield S.moveToY(doctor, 110);
            doctor.direction.set(0, 1);
            yield S.wait(1);
            yield S.moveToY(doctor, 80);
            yield S.moveToX(doctor, 128);
            yield S.moveToY(doctor, 88);
            doctor.direction.set(0, 1);
            yield S.wait(1.1);
            doctor.direction.set(-1, 0);
            yield S.wait(0.2);
            doctor.direction.set(0, -1);
            yield S.wait(1.2);
            doctor.running = false;

            yield S.moveToY(doctor, 47);

            yield S.wait(1.8);

            flash();
            cabinet.open();
            yield S.tween(0.25, doctor, 'y', doctor.y, 80);
            yield S.wait(2);
            global.game.playMusic('arg/booms');
            yield S.wait(1);
            doctor.direction.set(-1, 0); yield S.wait(1);
            doctor.direction.set(0, 1); yield S.wait(1);
            doctor.direction.set(-1, 0); yield S.wait(0.2);
            doctor.direction.set(0, -1); yield S.wait(1.5);

            doctor.running = true;
            yield S.moveToY(doctor, 48);
            cabinet.close();
            yield S.wait(1);
            yield S.moveToY(doctor, 80);
            yield S.moveToX(doctor, 43);
            yield S.moveToY(doctor, 160);
            yield S.wait(1);
            yield S.fadeOut(0);

            global.world.runScript(function*() {
                yield S.wait(17.5);
                let sound = global.world.playSound('arg/riser');
                sound.onDone = () => global.game.stopMusic();
            });

            yield S.wait(0.5);

            let timeBetweenTexts = 1.5;
            global.world.runScript(finaleText(97, 96, "Who is he?", 0x005C93)); yield S.wait(timeBetweenTexts);
            global.world.runScript(finaleText(190, 185, "He came from the outside?", 0x894A21)); yield S.wait(timeBetweenTexts);
            global.world.runScript(finaleText(233, 23, "Is he one of us?", 0x2E9B36)); yield S.wait(timeBetweenTexts);
            global.world.runScript(finaleText(163, 158, "He's dangerous", 0x636363)); yield S.wait(timeBetweenTexts);
            global.world.runScript(finaleText(80, 23, "Was he sent here?", 0x7A9633)); yield S.wait(timeBetweenTexts);
            global.world.runScript(finaleText(114, 72, "he doesn't know anything.", 0xAD4500)); yield S.wait(timeBetweenTexts);
            global.world.runScript(finaleText(230, 108, "He can't be trusted.", 0x685700)); yield S.wait(timeBetweenTexts);
            global.world.runScript(finaleText(148, 216, "Don't you know who his mother is?", 0x007F7F)); yield S.wait(timeBetweenTexts);
            global.world.runScript(finaleText(179, 48, "It's all over...", 0xA02E91)); yield S.wait(timeBetweenTexts);
            global.world.runScript(finaleText(272, 145, "why...?", 0x6C009E)); yield S.wait(1);
            global.world.runScript(finaleText(114, 132, "One thing is for certain.", 0x681F2F));
            yield S.wait(12);
            yield typeText("He must not be allowed to leave.", global.gameWidth/2, global.gameHeight/2 - 8, 0x681F2F, 10, null, 2.5);
            yield S.wait(0.5);

            yield S.fadeOut(0, 0xFFFFFF);
            global.theater.clearSlides(1);
            global.world.select.name('vat_broken').setVisible(true);
            global.world.playSound('arg/shot', { humanized: false });
            global.world.playSound('arg/glass', { humanized: false });
            global.game.stopMusic();
            yield [
                S.fadeSlides(0.2),
                S.shake(2, 0.3),
            ];

            yield S.wait(4);

            global.theater.loadStage(() => new World());

            yield S.wait(7);

            if (!hasCompletedAchievement('B')) {
                updateAchievementProgress('B', p => 1);
                yield S.wait(9);
            }

            if (!GAME_DATA.arg2Trigger || !GAME_DATA.arg2Trigger.strategy) {
                global.game.loadMainMenu();
                return;
            }

            let snapshots: Texture[] = [];

            yield fadeText(global.gameWidth/2, global.gameHeight/2, "A message for the player:");
            yield S.wait(3);
            snapshots.push(global.world.takeSnapshot());
            yield fadeOutAllText();

            yield S.wait(1);
            yield fadeText(global.gameWidth/2, global.gameHeight/2 - 30, "You are very lucky.");
            yield S.wait(2);
            yield fadeText(global.gameWidth/2, global.gameHeight/2 + 30, "Finding the Scribbled Map item is [y]extremely rare[/y].");
            yield S.wait(5);
            snapshots.push(global.world.takeSnapshot());
            yield fadeOutAllText();

            yield S.wait(1);
            yield fadeText(global.gameWidth/2, global.gameHeight/2 - 30, "There is another, easier way to view this story segment.");
            yield S.wait(2);
            yield fadeText(global.gameWidth/2, global.gameHeight/2 + 30, "Simply join a Versus Mode game with the game id \"[r]BETA[/r]\"");
            yield S.wait(5);
            snapshots.push(global.world.takeSnapshot());
            yield fadeOutAllText();

            yield S.wait(1);
            yield fadeText(global.gameWidth/2, global.gameHeight/2 - 72, "This knowledge is yours to do with as you please.");
            yield S.wait(2);
            yield fadeText(global.gameWidth/2, global.gameHeight/2 - 12, "You may share it with others... or not.");
            yield S.wait(2);
            yield fadeText(global.gameWidth/2, global.gameHeight/2 + 48, "Thank you for playing my game! :)");
            yield S.wait(5);
            snapshots.push(global.world.takeSnapshot());

            let lastRowHeight = global.gameHeight - 27;

            let shareText = global.world.addWorldObject(new SpriteText({
                name: 'sharetext',
                x: global.gameWidth/2 - 52, y: lastRowHeight,
                text: 'SAVE IMAGE',
                anchor: Vector2.CENTER_LEFT,
                font: 'smallnumbers',
                alpha: 0,
            }));

            let clipboardShareButton = global.world.addWorldObject(new PatchedSnapshotsShareButton(global.gameWidth/2 - 65, lastRowHeight, snapshots));
            clipboardShareButton.alpha = 0;

            let continueButtonClicked = false;
            let continueButton = global.world.addWorldObject(new MenuTextButton({
                name: 'continuebutton',
                x: global.gameWidth/2 + 8, y: lastRowHeight - 7,
                text: 'Continue >',
                style: { color: 0xFFFFFF },
                alpha: 0,
                onClick: () => {
                    global.game.playSound('click');
                    continueButton.enabled = false;
                    continueButtonClicked = true;
                }
            }));
            yield [
                S.tween(1, continueButton, 'alpha', 0, 1),
                S.tween(1, shareText, 'alpha', 0, 1),
                S.tween(1, clipboardShareButton, 'alpha', 0, 1),
            ];

            yield S.waitUntil(() => continueButtonClicked);
            yield S.fadeOut(1);
            continueButton.kill();
            shareText.kill();
            clipboardShareButton.kill();
            global.world.select.typeAll(SpriteText).forEach(t => t.kill());

            yield S.fadeSlides(0);

            GAME_DATA.arg2Trigger.strategy = false;
            global.theater.runScript(function*() {
                yield;
                if (getLastRoundResult() === 'loss') {
                    GAME_DATA.health++;
                    global.theater.playCutscene(RoundResults.GAMEOVER);
                } else {
                    GAME_DATA.wins--;
                    global.theater.playCutscene(RoundResults.VICTORY);
                }
            });
        }
    }

    export const ARG3_GET_CODE: Cutscene = {
        script: function*() {
            global.game.stopMusic();

            let staticSound = global.world.playSound('arg/tvstatic');
            global.world.effects.post.filters.push(new StaticFilter(0xFFFFFF, 1));
            yield S.wait(1.5);
            global.world.effects.post.filters.pop();
            staticSound.stop();

            yield S.wait(4);

            yield typeText("There's a hidden door in\nthe bookcase", global.theater.width/2, global.theater.height/2 - 15, 0xFFFFFF, 20, 'arg/bubbles', 3);
            yield typeText("I saw my mom go through it once", global.theater.width/2, global.theater.height/2 - 7, 0xFFFFFF, 20, 'arg/bubbles', 3);
            yield typeText("I followed behind her, secretly", global.theater.width/2, global.theater.height/2 - 7, 0xFFFFFF, 20, 'arg/bubbles', 3);
            yield typeText("But I couldn't believe what\nI saw on the other side", global.theater.width/2, global.theater.height/2 - 15, 0xFFFFFF, 20, 'arg/bubbles', 3);
            yield S.wait(2);
            yield typeText("Why did it have to be her...?", global.theater.width/2, global.theater.height/2 - 7, 0xFFFFFF, 20, 'arg/bubbles', 3);
            yield typeText("I need to go back there. Today.", global.theater.width/2, global.theater.height/2 - 7, 0xFFFFFF, 20, 'arg/bubbles', 3);
            yield typeText("What was the code again?", global.theater.width/2, global.theater.height/2 - 7, 0xFFFFFF, 20, 'arg/bubbles', 2);
            yield typeText("That's right, I remember!", global.theater.width/2, global.theater.height/2 - 7, 0xFFFFFF, 20, 'arg/bubbles', 2);
            yield S.wait(1);

            let keypad = global.world.addWorldObject(new Sprite({ texture: 'arg/keypad', scale: 2 }));
            keypad.alpha = 0;
    
            yield S.doOverTime(3, t => {
                keypad.alpha = M.lerp(0, 0.4, t);
            });

            let codeText = global.world.addWorldObject(new SpriteText({
                x: 99*2, y: 28*2,
                anchor: Vector2.TOP_RIGHT,
                scale: 2,
                alpha: 0.4,
            }));

            yield S.wait(1);

            codeText.setText('0');
            yield S.wait(1);
            codeText.setText('06');
            yield S.wait(1);
            codeText.setText('062');
            yield S.wait(1);
            codeText.setText('0621');

            yield S.wait(1.5);

            yield S.fadeOut(0);

            yield S.wait(3);

            global.game.loadMainMenu();
            global.game.menuSystem.loadMenu(() => new AlmanacMenu('classic'));
        }
    }

    function flash() {
        global.theater.runScript(function*() {
            yield S.fadeOut(0, 0xFFFFFF);
            yield S.fadeSlides(0.2);
        });
    }

    function typeText(text: string, x: number, y: number, color: number, speed: number, dialogSound: string, waitTime: number) {
        return function*() {
            let spriteText = global.theater.addWorldObject(new SpriteText({
                x, y, text,
                anchor: Vector2.TOP_CENTER,
                justify: 'center',
                style: { color: color },
            }));

            spriteText.visibleCharCount = 0;
            yield S.loopFor(spriteText.getCharList().length, i => function*() {
                yield* S.wait(1/speed)();
                spriteText.visibleCharCount++;
                if (dialogSound) global.theater.playSound(dialogSound);
            });

            yield S.wait(waitTime);
            spriteText.kill();
        }
    }

    function tweenGlitchPower(filter: Effects.Filters.Glitch, power: number) {
        return function*() {
            yield* S.wait(0.4)();
            filter.strength = M.lerp(1, 128, power);
            filter.speed = M.lerp(2, 4, power);
            yield* S.wait(0.4)();
        };
    }

    function hideText(x: number, y: number) {
        return function*() {
            let blurredText = global.theater.addWorldObject(new BlurredText(2*x, 2*y, 'HIDE', 0xBBBBBB));
            let ri = Random.float();
            blurredText.updateCallback = function() {
                this.style.offsetX = M.lerp(0, 1, Tween.Easing.OscillateSine(10)(ri + this.life.time));
            }
            blurredText.layer = Theater.LAYER_SLIDES;
            blurredText.alpha = 0;
            yield S.doOverTime(1, t => blurredText.alpha = M.lerp(0, 0.5, t));
            yield S.wait(0.5);
            yield S.doOverTime(0.5, t => blurredText.setBlurAmount(M.lerp(1, 0, t)));
            yield S.wait(1);
            yield S.doOverTime(1, t => blurredText.alpha = M.lerp(0.5, 0, t));
            blurredText.kill();
        }
    }

    function finaleText(x: number, y: number, text: string, color: number) {
        return function*() {
            let blurredText = global.theater.addWorldObject(new BlurredText(x, y, text, color));
            blurredText.layer = Theater.LAYER_SLIDES;
            blurredText.alpha = 0;
            global.world.playSound('arg/static');
            yield S.doOverTime(3, t => blurredText.alpha = M.lerp(0, 1, t));
            yield S.wait(2);
            global.world.playSound('arg/softimpact');
            yield S.doOverTime(2, t => blurredText.setBlurAmount(M.lerp(1, 0, t)));
            yield S.wait(2);
            yield S.doOverTime(1, t => blurredText.alpha = M.lerp(1, 0, t));
            blurredText.kill();
        }
    }

    function fadeText(x: number, y: number, text: string) {
        return function*() {
            let spriteText = global.world.addWorldObject(new SpriteText({
                x, y, text,
                anchor: Vector2.CENTER,
                justify: 'center',
                alpha: 0,
                maxWidth: 260,
            }));
            yield S.doOverTime(3, t => spriteText.alpha = M.lerp(0, 1, t));
        }
    }

    function fadeOutAllText() {
        return function*() {
            let texts = global.world.select.typeAll(SpriteText);
            yield texts.map(text => S.doOverTime(3, t => text.alpha = M.lerp(1, 0, t)));
            texts.forEach(text => text.kill());
        }
    }
}