namespace BallItems {
    export class Magnet extends EquipmentItem {
        getName() { return 'Magnet'; }
        getDesc() { return `Magnetize toward enemies, up to 133% the normal speed/damage cap`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/magnet', 1);
        }
    }
}