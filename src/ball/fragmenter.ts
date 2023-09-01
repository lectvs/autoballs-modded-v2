namespace Balls {
    export class Fragmenter extends Ball {
        getName() { return 'Fragmenter'; }
        getDesc() {
            return `On death, shoot ${this.spikes} spikes in a circle that deal [r]${this.spikeDamage}<sword>[/r] each`;
        }
        getShopDmg() { return 1; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.NEPDEP, CreditsNames.FLAREDESEL]; }

        get spikes() { return 12; }
        get spikeDamage() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/fragmenter', 8, config);

            this.addAbility('onDeath', Fragmenter.onDeath);
        }

        private static onDeath(source: Fragmenter, world: World, killedBy: Ball): void {
            let spikeCounts = M.batch(source.spikes, 20);

            for (let i = 0; i < spikeCounts.length; i++) {
                let angle = (i+0.5)/spikeCounts.length * 360;
                world.addWorldObject(new Spike(source.x, source.y, Vector2.fromPolar(150, angle), source, source.spikeDamage, spikeCounts[i]));
                source.didShootProjectile(spikeCounts[i]);
            }
            world.playSound('spike');
        }
    }
}