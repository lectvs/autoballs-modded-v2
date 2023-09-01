namespace BallItems {
    export class Shield extends EquipmentItem {
        getName() { return 'Shield'; }
        getDesc() { return `Blocks the first discrete instance of damage`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/shield', 0);
        }
    }
}