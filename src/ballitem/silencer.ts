namespace BallItems {
    export class Silencer extends EquipmentItem {
        getName() { return 'Silencer'; }
        getDesc() { return `On collision, the damage that would have been dealt is instead shot as 1-3 homing spikes toward random enemies. Each spike gains +[r]1<sword>[/r]`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/silencer', 25);
        }
    }
}