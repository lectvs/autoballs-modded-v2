namespace Balls {
    export class Splinter extends Ball {
        getName() { return 'Splinter'; }
        getDesc() {
            if (this.spikes === 1) return `On death, shoot a homing spike at a random enemy that deals [r]1<sword>[/r]`;
            return `On death, shoot [lb]${this.spikes}[/lb] homing spikes at random enemies that deal [r]1<sword>[/r] each`;
        }
        getShopDmg() { return 1; }
        getShopHp() { return 2; }

        get spikes() { return 1 + this.level; }

        constructor(config: Ball.Config) {
            super('balls/splinter', 8, config);

            this.addAbility('onDeath', Splinter.onDeath);
        }

        private static onDeath(source: Splinter, world: World, killedBy: Ball) {
            let enemies = getEnemies(world, source);
            if (enemies.length === 0) return;

            let spikeCounts = M.batch(source.spikes, 20);

            for (let count of spikeCounts) {
                let randomBall = Ball.Random.element(enemies);
                world.addWorldObject(new HomingSpike(source.x, source.y, source, randomBall, 1, count, enemyBalls => Ball.Random.element(enemyBalls)));
                source.didShootProjectile(count);
            }
        }
    }
}