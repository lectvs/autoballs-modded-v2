/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Mocha extends OrbitEquipment {
        getName() { return 'Mocha'; }
        getDesc() { return `Starts moving before other balls`; }

        constructor() {
            super('equipments/mocha', 'items/mocha');
        }
    
        startEarlyTime = 0.75;
    }
}
