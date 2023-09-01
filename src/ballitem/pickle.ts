namespace BallItems {
    export class Pickle extends BallItem {
        getName() { return 'Pickle'; }
        getDesc() { return `Give a ball [g]+1<heart>[/g]`; }
        getShopCost() { return 1; }
    
        canFreeze: boolean = false;

        constructor(x: number, y: number) {
            super(x, y, 'items/pickle');
        }
    
        onApplyToBall(ball: Ball): void {
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: 0, hp: 1 }));
        }
    }
}
