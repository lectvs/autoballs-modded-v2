namespace BallItems {
    export class Overcharger extends EquipmentItem {
        getName() { return 'Overcharger'; }
        getDesc() { return `Zap nearby enemies for [r]2<sword>/s[/r] initially, decaying to [r]1<sword>/s[/r] over 1s`; }

        private zapRing: ZapRing;

        constructor(x: number, y: number) {
            super(x, y, 'items/overcharger', 13);

            this.zapRing = this.addChild(new ZapRing(9, {
                y: -0.5,
                copyFromParent: ['layer'],
            }));
        }

        postUpdate(): void {
            super.postUpdate();
            World.Actions.orderWorldObjectAfter(this.zapRing, this);
            this.zapRing.radius = 9 * this.moveScale;
        }

        onApplyToBall(ball: Ball): void {
            super.onApplyToBall(ball);
            this.world?.playSound('zapequip', { humanized: false });
        }
    }
}