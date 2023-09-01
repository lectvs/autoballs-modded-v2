namespace Balls {
    export class Martyr extends Ball {
        getName() { return 'Martyr'; }
        getDesc() { return `On death, give ${buffText(this.buffAmount, this.buffAmount)} to a random ally`; }
        getShopDmg() { return 1; }
        getShopHp() { return 2; }

        get buffAmount() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/martyr', 8, config);

            this.addAbility('onDeath', Martyr.onDeath);
        }

        private static onDeath(source: Martyr, world: World, killedBy: Ball) {
            let validBalls = getAlliesNotSelf(world, source);
            if (validBalls.length === 0) return;

            let randomBall = Ball.Random.element(validBalls);
            world.addWorldObject(new RandomBuff(source.x, source.y, source, randomBall, { dmg: source.buffAmount, hp: source.buffAmount }, allies => Ball.Random.element(allies)));
        }
    }
}