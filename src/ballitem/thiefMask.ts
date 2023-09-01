namespace BallItems {
    export class ThiefMask extends EquipmentItem {
        getName() { return 'Thief Mask'; }
        getDesc() { return `Steal the equipment of a random enemy at the start of battle`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/thiefmask', 10);
        }
    }
}