/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class PolarityInverter extends OrbitEquipment {
        getName() { return 'Polarity Inverter'; }
        getDesc() { return `Travel in the opposite direction around the arena AND magnetize toward enemies`; }

        get timeToFullMagnetism() { return 1; }

        private applyMagnetismFactor: number;
        private applyMagnetismCooldown: Timer;

        private fan: Sprite;

        constructor() {
            super('equipments/polarityinverter', 'items/polarityinverter');

            this.fan = this.orbitingIcon.addChild(new Sprite({
                texture: 'equipments/polarityinverterfan',
                copyFromParent: ['layer'],
                vangle: -720,
            }));

            this.applyMagnetismFactor = 0;
            this.applyMagnetismCooldown = new Timer(0.5);
            this.applyMagnetismCooldown.finish();

            this.orbitingIcon.direction = -1;

            this.addAbility('update', PolarityInverter.update);
            this.addAbility('onCollideWithBallPreDamage', PolarityInverter.onCollideWithBallPreDamage);
        }

        reverseDirection = true;

        private static update(equipment: PolarityInverter, source: Ball, world: World) {
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

            equipment.magnetizeAmount = M.lerp(0, 0.5, equipment.applyMagnetismFactor);
        }

        private static onCollideWithBallPreDamage(equipment: PolarityInverter, source: Ball, world: World, ball: Ball): void {
            if (ball.team === source.team) return;
            equipment.applyMagnetismFactor = 0;
            equipment.applyMagnetismCooldown.reset();
            equipment.magnetizeAmount = 0;
        }
    }
}
