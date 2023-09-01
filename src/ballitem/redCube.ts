namespace BallItems {
    export class RedCube extends EquipmentItem {
        getName() { return 'Red Cube'; }
        getDesc() { return `Damage taken is spread over 3 seconds`; }
        getCredits() { return [CreditsNames.MATERWELONS]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/redcube', 33);
        }
    }
}