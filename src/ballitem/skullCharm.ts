namespace BallItems {
    export class SkullCharm extends EquipmentItem {
        getName() { return 'Skull Charm'; }
        getDesc() { return `Summon a ${buffText(1, 2)} skeleton on death\n\nSkeleton gains [r]+1<sword>[/r] for each [gold]<star>[/gold] on the equipped ball`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/skullcharm', 2);
        }
    }
}