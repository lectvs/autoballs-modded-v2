/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class VIPTicket extends OrbitEquipment {
        getName() { return 'VIP Ticket'; }
        getDesc() { return `The shop stocks one less ball and one extra item`; }

        constructor() {
            super('equipments/vipticket', 'items/vipticket');
        }
    
        stockExtraItems = 1;
    }
}
