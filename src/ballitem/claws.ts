namespace BallItems {
    export class Claws extends EquipmentItem {
        getName() { return 'Claws'; }
        getDesc() { return `Claw the first enemy collided with for [r]4<sword> extra[/r]`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/claws', 5);
        }
    }
}