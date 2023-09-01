namespace BallItems {
    export class Medkit extends EquipmentItem {
        getName() { return 'Medkit'; }
        getDesc() { return `Heal for [g]2<heart>[/g]\n2 seconds after taking any damage\n\nTaking damage resets the timer`; }
        getCredits() { return [CreditsNames.HOPOO_GAMES]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/medkit', 26);
        }
    }
}