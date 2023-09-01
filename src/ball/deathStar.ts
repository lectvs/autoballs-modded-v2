namespace Balls {
    export class DeathStar extends Ball {
        getName() { return 'Death Star'; }
        getDesc() { return `When an ally shoots a damaging projectile, [lb]${this.shootChancePercent}%[/lb] chance to shoot a [r]1<sword>[/r] homing spike at a random enemy`; }
        getShopDmg() { return 4; }
        getShopHp() { return 9; }

        get shootChancePercent() { return Math.min(5 + 15*this.level, 80); }
        get shootChance() { return this.shootChancePercent/100; }

        constructor(config: Ball.Config) {
            super('balls/deathstar', 16, config);
            this.mass = 8;

            this.addAbility('onBallShootProjectile', DeathStar.onBallShootProjectile);
        }

        private static onBallShootProjectile(source: DeathStar, world: World, ball: Ball, hitCount: number): void {
            if (ball.team !== source.team) return;
            if (ball instanceof DeathStar) return;

            let spikesShot = 0;
            for (let i = 0; i < hitCount; i++) {
                if (Ball.Random.boolean(source.shootChance)) spikesShot++;
            }

            if (spikesShot > 0) {
                let enemies = getEnemies(world, source);
                if (enemies.length === 0) return;

                let spikeCounts = M.batch(spikesShot, 3);
    
                let randomBall = Ball.Random.element(enemies);
                for (let count of spikeCounts) {
                    world.addWorldObject(new HomingSpike(source.x, source.y, source, randomBall, 1, count, enemyBalls => Ball.Random.element(enemyBalls)));
                    source.didShootProjectile(count);
                }
            }
        }
    }
}