namespace BallItems {
    export class HuntersMark extends EquipmentItem {
        getName() { return "Hunter's Mark"; }
        getDesc() { return `On enter battle, place a mark on a random enemy. All ally spikes will home in on that enemy`; }
        getCredits() { return [CreditsNames.TOMMYDOG145, CreditsNames.NEPDEP]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/huntersmark', 39);
        }
    }
}