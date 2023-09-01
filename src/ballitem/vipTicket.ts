namespace BallItems {
    export class VIPTicket extends EquipmentItem {
        getName() { return 'VIP Ticket'; }
        getDesc() { return `While equipped, the shop stocks one less ball and one extra item`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/vipticket', 18);
        }
    }
}