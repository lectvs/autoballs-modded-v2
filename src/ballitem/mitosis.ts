namespace BallItems {
    export class Mitosis extends EquipmentItem {
        getName() { return 'Mitosis'; }
        getDesc() { return `At the start of battle, split into two copies with\n[r]half <sword>[/r], [g]half <heart>[/g], and [gold]half <star>[/gold]\n\n(Activates before other abilities)`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/mitosis', 27);
        }
    }
}