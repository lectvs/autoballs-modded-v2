namespace BallItems {
    export class BestFriend extends EquipmentItem {
        getName() { return 'Best Friend'; }
        getDesc() { return `On death, revive with [r]1<sword>[/r] [g]1<heart>[/g]`; }
        getCredits() { return [CreditsNames.HOPOO_GAMES]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/bestfriend', 20);
        }
    }
}