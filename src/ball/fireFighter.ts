namespace Balls {
    export class FireFighter extends Ball {
        getName() { return 'Fire Fighter'; }
        getDesc() { return `Every ${this.maxShootTime}s, shoot a [r]${this.spikeDmg}<sword>[/r] homing spike at every burning enemy`; }
        getShopDmg() { return 3; }
        getShopHp() { return 8; }

        get maxShootTime() { return 0.5; }
        get spikeDmg() { return 1 + 0.5*(this.level-1); }

        private shootTime: number;

        constructor(config: Ball.Config) {
            super('balls/firefighter', 8, config);

            this.shootTime = 0;

            this.addAbility('update', FireFighter.update, { canActivateTwice: false });
        }

        private static update(source: FireFighter, world: World) {
            if (source.state !== Ball.States.PRE_BATTLE && source.state !== Ball.States.BATTLE) return;

            source.shootTime += source.delta;
            if (source.shootTime >= source.maxShootTime) {
                FireFighter.shootEnemies(source, world);
                if (source.shouldActivateAbilityTwice()) {
                    FireFighter.shootEnemies(source, world);
                }

                source.shootTime -= source.maxShootTime;
            }
        }

        private static shootEnemies(source: FireFighter, world: World) {
            let validEnemies = getEnemies(world, source).filter(enemy => enemy.isBurning());

            for (let enemy of validEnemies) {
                world.addWorldObject(new HomingSpike(source.x, source.y, source, enemy, source.spikeDmg, 1, enemyBalls => undefined));
                source.didShootProjectile(1);
            }
        }
    }
}