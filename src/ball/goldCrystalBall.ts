namespace Balls {
    export class GoldCrystalBall extends Ball {
        getName() { return 'Crystal Ball [gold]<star>[/gold]'; }
        getDesc() { return `On sell, give ${GoldCrystalBall.getBuffAmount(this)}[gold]<star>[/gold] to a random ally`; }
        getShopDmg() { return 1; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.NEPDEP]; }

        static getBuffAmount(source: Ball) { return source.level; }

        constructor(config: Ball.Config) {
            super('balls/goldcrystalball', 8, config);

            this.addAbility('onSell', GoldCrystalBall.onSell);
        }

        static onSell(source: Ball, world: World) {
            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.isInShop);
            if (validBalls.length === 0) return;

            let randomBall = Ball.Random.element(validBalls);
            
            let levels = GoldCrystalBall.getBuffAmount(source);
            for (let i = 0; i < levels; i++) {
                world.addWorldObject(new HomingBoost(source.x, source.y, source, randomBall, 1, Ball.Random.float(0.5, 0.9), _ => Ball.Random.element(validBalls)));
            }
        }
    }
}