namespace BallItems {
    export class BirthdayCake extends BallItem {
        getName() { return 'Birthday Cake'; }
        getDesc() { return `Enter [gold]Birthday Mode[/]! Every Pi<ntick>ata you buy gives your team a buff!`; }
        getShopCost() { return 3; }

        canFreeze: boolean = false;
    
        constructor(x: number, y: number) {
            super(x, y, 'items/birthdaycake');

            this.addChild(new Sprite({
                texture: 'buffbeams',
                blendMode: Texture.BlendModes.ADD,
                copyFromParent: ['layer'],
                scale: 0.25,
                vangle: 90,
                update: function() {
                    World.Actions.orderWorldObjectBefore(this, this.parent);
                },
            }));
        }
    
        onApplyToBall(ball: Ball): void {
            let world = this.world;
            world.runScript(function*() {
                let flash = world.addWorldObject(new Sprite({
                    texture: Texture.filledRect(global.gameWidth, global.gameHeight, 0xFFFFFF),
                    alpha: 0,
                }));

                world.playSound('sweep');

                yield S.tween(1.8, flash, 'alpha', 0, 1);

                Arenas.SET_FOR_ARENA(world, Arenas.ARENA_BDAY);
                GAME_DATA.arena = Arenas.ARENA_BDAY;

                global.game.playSound('yay').volume = 0.5;
                global.game.playSound('confetti').volume = 0.7;

                let puffPositions = [vec2(80, 80), vec2(240, 160), vec2(80, 160), vec2(240, 80), vec2(80, 80), vec2(240, 160), vec2(80, 160)];
                world.runScript(S.loopFor(puffPositions.length, i => function*() {
                    global.game.playSound('popper').volume = 0.35;

                    let puffSystem = world.addWorldObject(new BurstPuffSystem({
                        x: puffPositions[i].x, y: puffPositions[i].y,
                        puffCount: 25,
                        puffConfigFactory: () => ({
                            maxLife: 0.5,
                            v: Random.inCircle(200),
                            color: Random.element([0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFFFFF]),
                            radius: 4,
                            finalRadius: 0,
                        }),
                    }));
                    World.Actions.orderWorldObjectBefore(puffSystem, flash);

                    yield S.wait(0.2);
                }));

                yield S.tween(0.5, flash, 'alpha', 1, 0);
            });
        }
    }
}
