class HomingMark extends Sprite {
    private source: Ball;
    target: Ball;
    private targetPt: Pt;
    private reacquireTargetFn: (enemyBalls: Ball[]) => Ball;

    constructor(x: number, y: number, source: Ball, initialTarget: Ball, reacquireTargetFn: (enemyBalls: Ball[]) => Ball) {
        super({
            x, y,
            texture: 'equipments/huntersmark',
            layer: Battle.Layers.fx,
        });

        this.source = source;
        this.target = initialTarget;
        this.targetPt = this.target.getPosition();
        this.reacquireTargetFn = reacquireTargetFn;
    }

    onAdd() {
        this.world.playSound('swoosh');
            
        let sendScript = this.runScript(sendTo(1, this, this.targetPt, Ball.Random.onCircle(150)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (this.life.time > 0.5 && G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                this.target.addMarked(Infinity);
                this.kill();
            }),
        ));
    }

    update(): void {
        if (!this.target.world) {
            let newTarget = this.acquireTarget();
            if (newTarget) {
                this.target = newTarget;
            } else {
                this.kill();
            }
        }

        this.targetPt.x = this.target.x;
        this.targetPt.y = this.target.y;

        super.update();
        this.angle = M.atan2(this.y - this.lasty, this.x - this.lastx) + 90;
    }

    private acquireTarget() {
        if (!this.reacquireTargetFn) return undefined;
        let enemies = getEnemies(this.world, this.source);
        return this.reacquireTargetFn(enemies);
    }
}