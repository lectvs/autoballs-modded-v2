namespace BallItems {
    export class BallSharpener extends BallItem {
        getName() { return 'Ball Sharpener'; }
        getDesc() { return `Give a ball [r]+${this.buffAmount}<sword>[/r]`; }
    
        get buffAmount() { return 2; }
    
        constructor(x: number, y: number) {
            super(x, y, 'items/ballsharpener');
        }
    
        onApplyToBall(ball: Ball): void {
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: this.buffAmount, hp: 0 }));
        }
    }
}
