namespace BallItems {
    export class CursedDoll extends EquipmentItem {
        getName() { return 'Cursed Doll'; }
        getDesc() { return `On death, transform the killer into a skeleton`; }
        getCredits() { return [CreditsNames.MATERWELONS]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/curseddoll', 35);
        }
    }
}