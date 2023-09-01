namespace Balls {
    export class Trainer extends Ball {
        getName() { return 'Trainer'; }
        getDesc() { return `When an ally enters battle, give it [r]${this.buffDamage}<sword>[/r]`; }
        getShopDmg() { return 5; }
        getShopHp() { return 7; }

        get buffDamage() { return 1 + 0.5*(this.level-1); }

        constructor(config: Ball.Config) {
            super('balls/trainer', 8, config);

            this.addAbility('onBallEnterBattle', Trainer.onBallEnterBattle);
        }

        private static onBallEnterBattle(source: Trainer, world: World, ball: Ball) {
            if (ball.team !== source.team) return;
            
            world.runScript(function*() {
                yield;
                ball.buff(source.buffDamage, 0);

                source.addChild(new Sprite({
                    texture: 'buffbeams',
                    blendMode: Texture.BlendModes.ADD,
                    copyFromParent: ['layer'],
                    scale: (source.physicalRadius + 4) / 64,
                    life: 0.5,
                    vangle: 90,
                    update: function() {
                        this.alpha = M.jumpParabola(0, 1, 0, this.life.progress);
                        World.Actions.orderWorldObjectBefore(this, this.parent);
                    },
                }));
            });
        }
    }
}