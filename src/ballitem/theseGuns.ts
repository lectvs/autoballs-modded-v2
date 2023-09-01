namespace BallItems {
    export class TheseGuns extends EquipmentItem {
        getName() { return 'These Guns!!'; }
        getDesc() { return `Punches nearby enemies for [r]2<sword>[/r] each. Breaks after two punches.`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/guns', 6);
        }
    }
}