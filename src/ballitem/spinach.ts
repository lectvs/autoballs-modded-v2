namespace BallItems {
    export class Spinach extends BallItem {
        getName() { return 'Spinach'; }
        getDesc() { return `Give a ball ${buffText(this.buffDmgAmount, this.buffHpAmount)}`; }
    
        get buffDmgAmount() { return 1; }
        get buffHpAmount() { return 1; }
    
        constructor(x: number, y: number) {
            super(x, y, 'items/spinach');
        }
    
        onApplyToBall(ball: Ball): void {
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: this.buffDmgAmount, hp: this.buffHpAmount }));
        }
    }
}
