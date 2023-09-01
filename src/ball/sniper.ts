namespace Balls {
    type EnemyTracker = {
        lastHp: number;
        lastDmg: number;
        totalGain: number;
    }

    export class Sniper extends Ball {
        getName() { return 'Sniper'; }
        getDesc() { return `When an enemy is summoned or gains ${this.gainInterval} [r]<sword>[/r]/[g]<heart>[/g], shoot a [r]${this.bulletDmg}<sword>[/r] bullet at it`; }
        getShopDmg() { return 4; }
        getShopHp() { return 4; }

        get gainInterval() { return 1; }
        get bulletDmg() { return 1 + 0.5*(this.level-1); }
        get bulletSpeed() { return 600; }

        private enemyTrackers: Dict<EnemyTracker> = {};

        constructor(config: Ball.Config) {
            super('balls/sniper', 8, config);

            this.addAbility('update', Sniper.update, { canActivateTwice: false });
            this.addAbility('onBallJoin', Sniper.onBallJoin, { canActivateTwice: false });
        }

        private static update(source: Sniper, world: World) {
            if (source.state !== Ball.States.PRE_BATTLE && source.state !== Ball.States.BATTLE) return;
            Sniper.updateEnemyTrackers(source, world);
        }

        private static updateEnemyTrackers(source: Sniper, world: World) {
            let enemies = getEnemies(world, source);
            for (let enemy of enemies) {
                if (enemy.name && enemy.name in source.enemyTrackers) {
                    let tracker = source.enemyTrackers[enemy.name];

                    if (enemy.hp > tracker.lastHp) tracker.totalGain += enemy.hp - tracker.lastHp;
                    if (enemy.dmg > tracker.lastDmg) tracker.totalGain += enemy.dmg - tracker.lastDmg;

                    tracker.lastHp = enemy.hp;
                    tracker.lastDmg = enemy.dmg;

                    let bulletCount = 0;
                    while (tracker.totalGain >= source.gainInterval) {
                        tracker.totalGain -= source.gainInterval;
                        bulletCount++;
                    }
                    if (bulletCount > 0) {
                        Sniper.shootBullets(source, world, enemy, bulletCount);
                        if (source.shouldActivateAbilityTwice()) {
                            source.doAfterTime(0.1, () => Sniper.shootBullets(source, world, enemy, bulletCount));
                        }
                    }
                } else {
                    source.enemyTrackers[enemy.name] = {
                        lastHp: enemy.hp,
                        lastDmg: enemy.dmg,
                        totalGain: 0,
                    };
                }
            }
        }

        private static onBallJoin(source: Sniper, world: World, ball: Ball) {
            if (ball.team === source.team) return;
            if (!ball.isSummon) return;
            Sniper.shootBullets(source, world, ball, 1);
            if (source.shouldActivateAbilityTwice()) {
                source.doAfterTime(0.1, () => Sniper.shootBullets(source, world, ball, 1));
            }
        }

        private static shootBullets(source: Sniper, world: World, enemy: Ball, bulletCount: number) {
            let bulletSpeed = Ball.Random.float(source.bulletSpeed - 50, source.bulletSpeed + 50);
            let bulletV = enemy.getPosition().subtract(source).setMagnitude(bulletSpeed);
            world.addWorldObject(new TurretBullet(source.x, source.y, bulletV, source, source.bulletDmg, bulletCount));
            world.playSound('shoot', { humanized: false }).speed = Random.float(0.95, 1.05);
            source.didShootProjectile(bulletCount);
        }
    }
}