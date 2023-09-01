namespace BallItems {
    export class Bounty extends EquipmentItem {
        getName() { return 'Bounty'; }
        getDesc() { return `Start the shop with [gold]1<coin>[/gold] extra for each kill (max [gold]3<coin>[/gold])`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/bounty', 11);
        }
    }
}