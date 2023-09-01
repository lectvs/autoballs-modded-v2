namespace Balls {
    export class Seeker extends Ball {
        getName() { return 'Seeker'; }
        getDesc() {
            return `On collision, shoot a [r]${this.spikeDamage}<sword>[/r] homing spike at a random enemy`;
        }
        getShopDmg() { return 1; }
        getShopHp() { return 2; }

        get spikeDamage() { return 1 + 0.5*(this.level-1); }

        private cooldown: AbilityCooldown;

        constructor(config: Ball.Config) {
            super('balls/seeker', 8, config);

            this.cooldown = new AbilityCooldown(0.5, 2);

            this.addAbility('onCollideWithEnemyPostDamage', Seeker.onCollideWithEnemyPostDamage);
        }

        update() {
            super.update();
            this.cooldown.update(this.delta);
        }

        private static onCollideWithEnemyPostDamage(source: Seeker, world: World, enemy: Ball): void {
            let enemies = getEnemies(world, source);
            if (enemies.length === 0) return;
            if (!source.cooldown.consumeUse()) return;

            let randomBall = Ball.Random.element(enemies);
            world.addWorldObject(new HomingSpike(source.x, source.y, source, randomBall, source.spikeDamage, 1, enemyBalls => Ball.Random.element(enemyBalls)));
            source.didShootProjectile(1);
        }
    }
}