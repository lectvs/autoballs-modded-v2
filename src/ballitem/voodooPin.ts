namespace BallItems {
    export class VoodooPin extends EquipmentItem {
        getName() { return 'Voodoo Pin'; }
        getDesc() { return `Sacrifice\n[g]1 max <heart>/s[/g] to damage the enemy with the highest [r]<sword>[/r] for [r]1.5<sword>/s[/r]\n\n[r]Can kill the wearer[/r]`; }
        getCredits() { return [CreditsNames.MATERWELONS]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/voodoopin', 24);
        }
    }
}