namespace BallItems {
    export class Polisher extends BallItem {
        getName() { return 'Polisher'; }
        getDesc() { return `Give a ball [g]+${this.buffAmount}<heart>[/g]`; }

        get buffAmount() { return 2; }

        constructor(x: number, y: number) {
            super(x, y, 'items/polisher');
        }

        onApplyToBall(ball: Ball): void {
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: 0, hp: this.buffAmount }));
        }
    }
}
