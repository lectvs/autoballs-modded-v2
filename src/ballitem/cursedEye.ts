namespace BallItems {
    export class CursedEye extends EquipmentItem {
        getName() { return 'Cursed Eye'; }
        getDesc() { return `Teleport away from enemies on taking damage`; }
        getCredits() { return [CreditsNames.ISAAC]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/cursedeye', 36);
        }
    }
}