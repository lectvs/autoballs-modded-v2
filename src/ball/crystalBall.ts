namespace Balls {
    export class CrystalBall extends Ball {
        getName() { return 'Crystal Ball'; }
        getDesc() { return `On sell, give\n${buffText(CrystalBall.getBuffAmount(this), CrystalBall.getBuffAmount(this))} to a random ally`; }
        getShopDmg() { return 2; }
        getShopHp() { return 4; }

        static getBuffAmount(source: Ball) { return source.level; }

        constructor(config: Ball.Config) {
            super('balls/crystalball', 8, config);

            this.addAbility('onSell', CrystalBall.onSell);
        }

        static onSell(source: Ball, world: World) {
            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.isInShop);
            if (validBalls.length === 0) return;

            let randomBall = Ball.Random.element(validBalls);
            world.addWorldObject(new RandomBuff(source.x, source.y, source, randomBall, { dmg: CrystalBall.getBuffAmount(source), hp: CrystalBall.getBuffAmount(source) }, _ => Ball.Random.element(validBalls)));
        }
    }
}