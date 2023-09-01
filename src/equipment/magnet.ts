/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Magnet extends OrbitEquipment {
        getName() { return 'Magnet'; }
        getDesc() { return `Magnetize toward enemies, up to 133% the normal speed cap`; }

        get timeToFullMagnetism() { return 1; }

        private applyMagnetismFactor: number;
        private applyMagnetismCooldown: Timer;

        constructor() {
            super('equipments/magnet', 'items/magnet');

            this.applyMagnetismFactor = 0;
            this.applyMagnetismCooldown = new Timer(0.5);

            this.addAbility('update', Magnet.update);
            this.addAbility('onCollideWithBallPreDamage', Magnet.onCollideWithBallPreDamage);
        }

        private static update(equipment: Magnet, source: Ball, world: World) {
            if (source.state === Ball.States.BATTLE) {
                equipment.applyMagnetismCooldown.update(equipment.delta);
                if (equipment.applyMagnetismCooldown.done) {
                    equipment.applyMagnetismFactor = M.moveToClamp(equipment.applyMagnetismFactor, 1, 1 / equipment.timeToFullMagnetism, equipment.delta);
                } else {
                    equipment.applyMagnetismFactor = 0;
                }
            } else {
                equipment.applyMagnetismFactor = 0;
            }

            equipment.magnetizeAmount = M.lerp(0, 0.34, equipment.applyMagnetismFactor);
        }

        private static onCollideWithBallPreDamage(equipment: Magnet, source: Ball, world: World, ball: Ball): void {
            if (ball.team === source.team) return;
            equipment.applyMagnetismFactor = 0;
            equipment.applyMagnetismCooldown.reset();
            equipment.magnetizeAmount = 0;
        }
    }
}
