namespace BallItems {
    export class StarCatcher extends EquipmentItem {
        getName() { return 'Star Catcher'; }
        getDesc() { return `On enter battle, steal [gold]1<star>[/gold] from a random enemy`; }
        getCredits() { return [CreditsNames.NEPDEP]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/starcatcher', 30);
        }
    }
}