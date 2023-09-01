/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Spore extends OrbitEquipment {
        getName() { return 'Spore'; }
        getDesc() { return `[r]Every instance of damage received is increased by ${this.flatDamageChange}<sword>[/r]`; }

        constructor() {
            super('equipments/spore', 'equipments/spore');
        }
    
        flatDamageChange = 1;
    }
}
