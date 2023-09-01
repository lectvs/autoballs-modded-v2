namespace Balls {
    export class RedCrystalBall extends Ball {
        getName() { return 'Crystal Ball [r]<sword>[/r]'; }
        getDesc() { return `On sell, give [r]${RedCrystalBall.getBuffAmount(this)}<sword>[/r] to a random ally`; }
        getShopDmg() { return 1; }
        getShopHp() { return 3; }

        static getBuffAmount(source: Ball) { return source.level; }

        constructor(config: Ball.Config) {
            super('balls/redcrystalball', 8, config);

            this.addAbility('onSell', RedCrystalBall.onSell);
        }

        static onSell(source: Ball, world: World) {
            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.isInShop);
            if (validBalls.length === 0) return;

            let randomBall = Ball.Random.element(validBalls);
            world.addWorldObject(new RandomBuff(source.x, source.y, source, randomBall, { dmg: RedCrystalBall.getBuffAmount(source), hp: 0 }, _ => Ball.Random.element(validBalls)));
        }
    }
}