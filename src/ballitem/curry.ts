namespace BallItems {
    export class Curry extends EquipmentItem {
        getName() { return 'Curry'; }
        getDesc() { return `The equipped ball is on fire and moves at 200% speed for 10 seconds after entering battle`; }
        getCredits() { return [CreditsNames.C_RRY]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/curry', 40);
        }

        onApplyToBall(ball: Ball): void {
            super.onApplyToBall(ball);
            this.world?.playSound('fireignite', { humanized: false });
        }
    }
}