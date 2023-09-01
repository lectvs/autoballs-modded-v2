namespace Balls {
    export class GreenCrystalBall extends Ball {
        getName() { return 'Crystal Ball [g]<heart>[/g]'; }
        getDesc() { return `On sell, give [g]${GreenCrystalBall.getBuffAmount(this)}<heart>[/g] to a random ally`; }
        getShopDmg() { return 1; }
        getShopHp() { return 4; }

        static getBuffAmount(source: Ball) { return source.level; }

        constructor(config: Ball.Config) {
            super('balls/greencrystalball', 8, config);

            this.addAbility('onSell', GreenCrystalBall.onSell);
        }

        static onSell(source: Ball, world: World) {
            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.isInShop);
            if (validBalls.length === 0) return;

            let randomBall = Ball.Random.element(validBalls);
            world.addWorldObject(new RandomBuff(source.x, source.y, source, randomBall, { dmg: 0, hp: GreenCrystalBall.getBuffAmount(source) }, _ => Ball.Random.element(validBalls)));
        }
    }
}