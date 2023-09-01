/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Silencer extends OrbitEquipment {
        getName() { return 'Silencer'; }
        getDesc() { return `On collision, the damage that would have been dealt is instead shot as 1-3 homing spikes toward random enemies. Each spike gains +[r]1<sword>[/r]`; }

        noCollisionDamage = true;

        private cooldown: AbilityCooldown;

        constructor() {
            super('equipments/silencer', 'items/silencer');
            
            this.cooldown = new AbilityCooldown(0.2, 2);

            this.addAbility('onCollideWithEnemyPostDamage', Silencer.onCollideWithEnemyPostDamage);
        }

        update() {
            super.update();
            this.cooldown.update(this.delta);
        }

        private static onCollideWithEnemyPostDamage(equipment: Silencer, source: Ball, world: World, ball: Ball, damage: number) {
            if (damage <= 0) return;
            if (!equipment.cooldown.consumeUse()) return;
            
            let enemies = getEnemies(world, source);
            if (enemies.length === 0) return;

            let numSpikes = Ball.Random.int(1, 3);
            for (let i = 0; i < numSpikes; i++) {
                let randomBall = Ball.Random.element(enemies);
                world.addWorldObject(new HomingSpike(source.x, source.y, source, randomBall, damage/numSpikes + 1, 1, enemyBalls => Ball.Random.element(enemyBalls)));
                source.didShootProjectile(1);
            }
        }
    }
}
