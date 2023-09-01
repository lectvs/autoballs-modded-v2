namespace BallItems {
    export class Polisher1 extends BallItem {
        getName() { return 'Mini Polisher'; }
        getDesc() { return `Give a ball [g]+${this.buffAmount}<heart>[/g]`; }
    
        get buffAmount() { return 1; }
    
        constructor(x: number, y: number) {
            super(x, y, 'items/polisher1');
        }
    
        onApplyToBall(ball: Ball): void {
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: 0, hp: this.buffAmount }));
        }
    }
}
