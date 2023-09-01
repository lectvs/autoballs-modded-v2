namespace BallItems {
    export class ConsolationPrize extends BallItem {
        getName() { return 'Consolation Prize'; }
        getDesc() { return `Give a ball ${buffText(this.buffDmgAmount, this.buffHpAmount)}\n\nOnly available if you lost the previous round`; }
    
        get buffDmgAmount() { return 2; }
        get buffHpAmount() { return 2; }
    
        constructor(x: number, y: number) {
            super(x, y, 'items/consolationprize');
        }
    
        onApplyToBall(ball: Ball): void {
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: this.buffDmgAmount, hp: this.buffHpAmount }));
        }
    }
}
