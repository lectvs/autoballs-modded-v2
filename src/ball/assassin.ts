/// <reference path="./ball.ts" />

namespace Balls {
    type EnemyTracker = {
        lastHp: number;
    }

    export class Assassin extends Ball {
        getName() { return 'Assassin'; }
        getDesc() { return `When an enemy falls to [g]${this.executeThreshold}<heart>[/g] or below, shoot a [r]${this.executeThreshold}<sword>[/r] homing spike at it`; }
        getShopDmg() { return 2; }
        getShopHp() { return 5; }

        get executeThreshold() { return this.level; }

        private enemyTrackers: Dict<EnemyTracker> = {};
        private canUpdateEnemyTrackersTimer: Timer;

        constructor(config: Ball.Config) {
            super('balls/assassin', 8, config);

            this.canUpdateEnemyTrackersTimer = this.addTimer(0.5);
            this.canUpdateEnemyTrackersTimer.finish();

            this.addAbility('update', Assassin.update, { canActivateTwice: false });
        }

        onStateChangePreBattle() {
            Assassin.updateEnemyTrackers(this, this.world);
        }

        private static update(source: Assassin, world: World) {
            if (source.state !== Ball.States.BATTLE && source.state !== Ball.States.PRE_BATTLE) return;
            
            if (source.canUpdateEnemyTrackersTimer.done) {
                Assassin.updateEnemyTrackers(source, world);
            }
        }

        private static updateEnemyTrackers(source: Assassin, world: World) {
            let enemies = getEnemies(world, source);
            for (let enemy of enemies) {
                if (enemy.name && enemy.name in source.enemyTrackers) {
                    let tracker = source.enemyTrackers[enemy.name];

                    if (enemy.hp <= source.executeThreshold && tracker.lastHp > source.executeThreshold) {
                        Assassin.shootSpike(source, world, enemy);
                        if (source.shouldActivateAbilityTwice()) {
                            Assassin.shootSpike(source, world, enemy);
                        }
                        source.canUpdateEnemyTrackersTimer.reset();
                    }

                    tracker.lastHp = enemy.hp;
                } else {
                    source.enemyTrackers[enemy.name] = {
                        lastHp: enemy.hp,
                    };
                }
            }
        }

        private static shootSpike(source: Assassin, world: World, enemy: Ball) {
            world.addWorldObject(new HomingSpike(source.x, source.y, source, enemy, source.executeThreshold, 1, enemyBalls => undefined));
            source.didShootProjectile(1);
        }
    }
}