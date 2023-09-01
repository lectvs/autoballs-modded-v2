namespace Balls {
    export class Spiker extends Ball {
        getName() { return 'Spiker'; }
        getDesc() {
            return `When this takes discrete damage, shoot [lb]${this.spikes}[/lb] random spikes that deal [r]${this.spikeDamage}<sword>[/r] each`;
        }
        getShopDmg() { return 1; }
        getShopHp() { return 6; }

        get spikes() { return 1 + this.level; }
        get spikeDamage() { return 0.75 + 0.25*this.level; }

        constructor(config: Ball.Config) {
            super('balls/spiker', 8, config);

            this.addAbility('onTakeDamage', Spiker.onTakeDamage);
        }

        private static onTakeDamage(source: Spiker, world: World, damage: number): void {
            let spikeCounts = M.batch(source.spikes, 20);

            for (let count of spikeCounts) {
                world.addWorldObject(new Spike(source.x, source.y, Ball.Random.onCircle(150), source, source.spikeDamage, count));
                source.didShootProjectile(count);
            }
            world.playSound('spike');
        }
    }
}