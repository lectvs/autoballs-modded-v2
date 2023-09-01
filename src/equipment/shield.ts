/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Shield extends OrbitEquipment {
        getName() { return 'Shield'; }
        getDesc() { return `Blocks the first discrete instance of damage`; }

        constructor() {
            super('equipments/shield', 'items/shield');
        }
    
        blockOneDiscreteDamage = true;
    }
}
