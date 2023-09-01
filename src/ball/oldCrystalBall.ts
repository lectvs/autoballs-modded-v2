namespace Balls {
    export class OldCrystalBall extends Ball {
        getName() { return 'Old Crystal Ball'; }
        getDesc() { return `On sell, give [r]${OldCrystalBall.getBuffAmount(this)}<sword>[/r] to all shop balls`; }
        getShopDmg() { return 6; }
        getShopHp() { return 2; }

        static getBuffAmount(source: Ball) { return source.level; }

        constructor(config: Ball.Config) {
            super('balls/oldcrystalball', 8, config);

            this.addAbility('onSell', OldCrystalBall.onSell);
        }

        static onSell(source: Ball, world: World) {
            let validBalls = getAlliesNotSelf(world, source).filter(ball => ball.isInShop);
            if (validBalls.length === 0) return;

            for (let ball of validBalls) {
                world.addWorldObject(new RandomBuff(source.x, source.y, source, ball, { dmg: OldCrystalBall.getBuffAmount(source), hp: 0 }, _ => undefined));
            }
        }
    }
}