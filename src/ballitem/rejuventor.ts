namespace BallItems {
    export class Rejuvenator extends EquipmentItem {
        getName() { return 'Rejuvenator'; }
        getDesc() { return `Passively heal for [g]0.5<heart>/s[/g]`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/rejuvenator', 7);
        }
    }
}