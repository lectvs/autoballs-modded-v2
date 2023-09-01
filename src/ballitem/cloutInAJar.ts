namespace BallItems {
    export class CloutInAJar extends BallItem {
        getName() { return 'Clout-In-A-Jar'; }
        getDesc() { return `Gain +[gold]1<star>[/gold]`; }
    
        constructor(x: number, y: number) {
            super(x, y, 'items/clout');
        }

        onApplyToBall(ball: Ball): void {
            ball.levelUp(undefined, true, false);
        }
    }
}
