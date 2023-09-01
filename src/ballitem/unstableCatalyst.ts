namespace BallItems {
    export class UnstableCatalyst extends EquipmentItem {
        getName() { return 'Unstable Catalyst'; }
        getDesc() { return `Passively convert -[g]0.25<heart>/s[/g] into +[r]1<sword>/s[/r] during battle. Stops when health is 0`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/unstablecatalyst', 12);
        }
    }
}