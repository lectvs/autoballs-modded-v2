namespace BallItems {
    export class Bandaid extends EquipmentItem {
        getName() { return 'Bandaid'; }
        getDesc() { return `Gain [g]1<heart>[/g]\n\nIf the equipped ball dies during battle, it gains [g]1<heart>[/g] next round`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/bandaid', 17);
        }

        onApplyToBall(ball: Ball): void {
            super.onApplyToBall(ball);
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: 0, hp: 1 }));
        }
    }
}