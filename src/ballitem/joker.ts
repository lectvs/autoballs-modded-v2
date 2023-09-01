namespace BallItems {
    export class Joker extends EquipmentItem {
        getName() { return 'Joker'; }
        getDesc() { return `Scramble enemy positions at the start of battle\n\nPermanently breaks after use`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/joker', 37);
        }
    }
}