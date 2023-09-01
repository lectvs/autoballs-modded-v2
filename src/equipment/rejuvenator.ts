/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Rejuvenator extends OrbitEquipment {
        getName() { return 'Rejuvenator'; }
        getDesc() { return `Passively heal for [g]0.5<heart>/s[/g]`; }

        constructor() {
            super('equipments/rejuvenator', 'items/rejuvenator');

            this.addAbility('update', Rejuvenator.update);
        }
    
        private static update(equipment: Rejuvenator, source: Ball, world: World) {
            if (source.state !== Ball.States.BATTLE && source.state !== Ball.States.PRE_BATTLE) return;

            source.healFor(0.5 * equipment.delta, source);
        }
    }
}
