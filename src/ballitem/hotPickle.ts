namespace BallItems {
    export class HotPickle extends BallItem {
        getName() { return 'Hot Pickle'; }
        getDesc() { return `Give a ball [r]+1<sword>[/r]`; }
        getShopCost() { return 1; }

        canFreeze: boolean = false;
    
        constructor(x: number, y: number) {
            super(x, y, 'items/hotpickle');
        }
    
        onApplyToBall(ball: Ball): void {
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: 1, hp: 0 }));
        }
    }
}
