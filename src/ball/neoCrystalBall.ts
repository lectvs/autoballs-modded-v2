namespace Balls {
    export class NeoCrystalBall extends Ball {
        getName() { return 'Neo Crystal Ball'; }
        getDesc() { return `On sell, give a random ally either [g]${NeoCrystalBall.getBuffAmount(this)}<heart>[/g] or [r]${NeoCrystalBall.getBuffAmount(this)}<sword>[/r] (random)`; }
        getShopDmg() { return 2; }
        getShopHp() { return 4; }

        static getBuffAmount(source: Ball) { return 2*source.level; }

        private overlay: Sprite;

        constructor(config: Ball.Config) {
            super('balls/neocrystalball', 8, config);

            this.overlay = this.addChild(new Sprite({
                texture: 'neocrystalballoverlay',
                copyFromParent: ['layer'],
            }));

            this.addAbility('onSell', NeoCrystalBall.onSell);
        }

        postUpdate() {
            super.postUpdate();
            this.overlay.alpha = this.alpha;
            this.overlay.scale = this.ballScale * this.moveScale;
            World.Actions.orderWorldObjectAfter(this.overlay, this);
        }

        static onSell(source: Ball, world: World) {
            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.isInShop);
            if (validBalls.length === 0) return;

            let randomBuff = Ball.Random.boolean() ? { dmg: NeoCrystalBall.getBuffAmount(source), hp: 0 } : { dmg: 0, hp: NeoCrystalBall.getBuffAmount(source) };

            let randomBall = Ball.Random.element(validBalls);
            world.addWorldObject(new RandomBuff(source.x, source.y, source, randomBall, randomBuff, _ => Ball.Random.element(validBalls)));
        }
    }
}