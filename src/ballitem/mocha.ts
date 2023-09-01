namespace BallItems {
    export class Mocha extends EquipmentItem {
        getName() { return 'Mocha'; }
        getDesc() { return `Start moving before other balls`; }
        getCredits() { return [CreditsNames.NEPDEP]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/mocha', 42);
        }
    }
}