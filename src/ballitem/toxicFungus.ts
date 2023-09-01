namespace BallItems {
    export class ToxicFungus extends EquipmentItem {
        getName() { return 'Toxic Fungus'; }
        getDesc() { return `On enter battle, plant a [dg]spore equipment[/dg] on the enemy with the highest [g]<heart>[/g]\n\nSpored balls take [r]1<sword>[/r] extra per hit`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/toxicfungus', 15);
        }
    }
}