namespace BallItems {
    export class Jetpack extends EquipmentItem {
        getName() { return 'Jetpack'; }
        getDesc() { return `Accelerate up to 2x speed. Breaks on collision with an enemy`; }
        getCredits() { return [CreditsNames.ANYTHING_GOES]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/jetpack', 28);
        }
    }
}