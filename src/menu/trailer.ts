namespace TrailerMenu {
    export class Trailer1 extends Menu {
        constructor() {
            super({
                backgroundColor: 0x000000,
                volume: 1,
            });
            global.game.stopMusic();
    
            this.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));
    
            let documents = ['trailer/title', 'trailer/build', 'trailer/battle', 'trailer/playfree'];
    
            let tm = this;
            this.runScript(function*() {
                yield S.waitUntil(() => Input.justDown('4'));
                yield;
    
                for (let doc of documents) {
                    let objs = tm.addWorldObjects(lciDocumentToWorldObjects(doc));
    
                    tm.select.name<Sprite>('title').updateCallback = function() {
                        this.angle = Math.sin(2*this.life.time) * 5;
                    };
            
                    if (tm.select.name<Sprite>('play', false)) {
                        tm.select.name<Sprite>('play').updateCallback = function() {
                            this.angle = Math.sin(4*this.life.time + 12) * 3;
                        };
                    }
    
                    yield S.waitUntil(() => Input.justDown('4'));
                    yield;
    
                    tm.removeWorldObjects(objs);
                }
            });
        }
    }

    export class EmptyArena extends Menu {
        constructor() {
            super({
                backgroundColor: 0x000000,
                volume: 1,
            });
            global.game.stopMusic();

            let arena = Arenas.BASE();
            Arenas.SET_FOR_ARENA(arena, 'first');
            this.addWorldObject(new Theater.WorldAsWorldObject(arena));
        }
    }

    export class LectvsPresents extends Menu {
        constructor() {
            super({
                backgroundColor: 0x000000,
                volume: 1,
            });
            global.game.stopMusic();

            let glitchFilter = new Effects.Filters.Glitch(4, 1, 2);

            let logo = this.addWorldObject(new Sprite({
                x: 0, y: -6,
                texture: 'lectvslogo',
                scale: 2,
                effects: { post: { filters: [glitchFilter] }},
                visible: false,
            }));

            let presents = this.addWorldObject(new SpriteText({
                x: 0, y: 20,
                text: 'presents',
                anchor: Vector2.CENTER,
                effects: { post: { filters: [glitchFilter] }},
                visible: false,
            }));

            World.Actions.balanceWorldObjects([logo, presents], global.gameWidth/2, global.gameHeight/2 + 4);

            let world = this;
            this.runScript(function*() {
                yield S.wait(5);

                world.playSound('glitch');
                logo.setVisible(true);
                presents.setVisible(true);

                yield S.wait(0.5);

                glitchFilter.enabled = false;
                yield S.wait(1.5);
                world.playSound('glitch');
                glitchFilter.enabled = true;

                yield S.wait(0.5);

                logo.setVisible(false);
                presents.setVisible(false);
            });
        }
    }

    export class BallCount extends Menu {
        constructor() {
            super({
                backgroundColor: 0x000000,
                volume: 1,
            });
            global.game.stopMusic();

            let count = this.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 100,
                text: '',
                anchor: Vector2.CENTER,
                scale: 5,
                update: function() {
                    if (this.getCurrentText() !== this.data.lastText && this.getCurrentText() !== '') {
                        let count = parseInt(this.getCurrentText());
                        let speed = Math.pow(2, count/30);
                        let sound = count === 30 ? 'ballcountreverb' : 'ballcount';
                        this.world.playSound(sound, { speed: isFinite(speed) ? speed : 1 });
                        this.data.lastText = this.getCurrentText();
                    }
                }
            }));

            let newBallsAndItems = this.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: 150,
                text: 'new balls and items',
                anchor: Vector2.CENTER,
                scale: 2,
            }));

            let world = this;
            this.runScript(function*() {
                yield S.wait(5);

                yield S.doOverTime(4, t => {
                    let c = Math.floor(M.lerp(0, 30, Tween.Easing.InCubic(t)));
                    if (c > 0) count.setText(`${c}`);
                });

                yield S.wait(1.5);
                count.setText('31');
                yield S.wait(0.9);
                count.setText('32');
                yield S.wait(0.5);
                count.setText('33');
                yield S.wait(0.43);

                yield S.doOverTime(1, t => {
                    let c = Math.floor(M.lerp(31, 50, t));
                    if (c > 31) count.setText(`${c}`);
                });

                count.style.color = 0xFFD800;
                newBallsAndItems.style.color = 0xFFD800;
                world.playSound('buyball');
                world.playSound('buff');
                world.playSound('yay');
                world.playSound('confetti');

                let flash = world.addWorldObject(new Sprite({
                    texture: Texture.filledRect(global.gameWidth, global.gameHeight, 0xFFFFFF),
                }));
                world.runScript(S.tween(0.1, flash, 'alpha', 1, 0));

                yield S.doOverTime(Infinity, t => {
                    count.scale = M.lerp(5, 7, Tween.Easing.OscillateSine(1)(count.life.time));
                    newBallsAndItems.scale = M.lerp(2, 2.1, Tween.Easing.OscillateSine(1)(count.life.time + 7.38));
                });
            });
        }
    }
}
