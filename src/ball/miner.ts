namespace Balls {
    export class Miner extends Ball {
        getName() { return 'Miner'; }
        getDesc() { return `When this takes discrete damage, drop a land mine that explodes for [r]${this.mineDamage}<sword>[/r] when an enemy rolls near it`; }
        getShopDmg() { return 1; }
        getShopHp() { return 6; }

        get mineDamage() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/miner', 8, config);

            this.addAbility('onTakeDamage', Miner.onTakeDamage);
        }

        private static onTakeDamage(source: Miner, world: World, damage: number): void {
            world.addWorldObject(new LandMine(source.x, source.y, Ball.Random.inDisc(60, 120), source, source.mineDamage));
        }
    }
}