/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Medkit extends OrbitEquipment {
        getName() { return 'Medkit'; }
        getDesc() { return `Heals for [g]2<heart>[/g]\n2 seconds after taking any damage. Taking damage resets the timer`; }

        private avoidTime: number;
        private hasTakenDamageOnce: boolean;

        static MAX_AVOID_TIME = 2;
        static HEAL_AMOUNT = 2;

        constructor() {
            super('equipments/medkit', 'items/medkit');
            this.avoidTime = 0;
            this.hasTakenDamageOnce = false;

            this.addAbility('update', Medkit.update);
            this.addAbility('onTakeDamage', Medkit.onTakeDamage);
            this.addAbility('onTakeLeechDamage', Medkit.onTakeLeechDamage);
        }

        private static update(equipment: Medkit, source: Ball, world: World): void {
            if (source.state !== Ball.States.BATTLE && source.state !== Ball.States.PRE_BATTLE) return;
            
            if (equipment.hasTakenDamageOnce && equipment.avoidTime > 0) {
                equipment.avoidTime -= equipment.delta;
                if (equipment.avoidTime <= 0) {
                    source.healFor(Medkit.HEAL_AMOUNT, source);
                    source.addHealthBuffPlus(Medkit.HEAL_AMOUNT);
                    source.showHpStat(Medkit.HEAL_AMOUNT, 1);
                    world.playSound('medkitgrab');
                    world.playSound('medkitheal');
                }
            }
        }

        private static onTakeDamage(equipment: Medkit, source: Ball, world: World, damage: number) {
            equipment.hasTakenDamageOnce = true;
            equipment.avoidTime = Medkit.MAX_AVOID_TIME;
        }
    
        private static onTakeLeechDamage(equipment: Medkit, source: Ball, world: World, damage: number) {
            equipment.hasTakenDamageOnce = true;
            equipment.avoidTime = Medkit.MAX_AVOID_TIME;
        }
    }
}
