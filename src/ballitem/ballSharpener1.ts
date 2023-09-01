namespace BallItems {
    export class BallSharpener1 extends BallItem {
        getName() { return 'Mini Sharpener'; }
        getDesc() { return `Give a ball [r]+${this.buffAmount}<sword>[/r]\n\nAvailable only in Tier 1`; }
    
        get buffAmount() { return 1; }
    
        constructor(x: number, y: number) {
            super(x, y, 'items/ballsharpener1');
        }
    
        onApplyToBall(ball: Ball): void {
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: this.buffAmount, hp: 0 }));
        }
    }
}
