class HomingBoost extends Sprite {
    target: Ball;
    private source: Ball;
    private targetPt: Pt;
    private levels: number;
    private time: number;
    private reacquireTargetFn: (allyBalls: Ball[]) => Ball;

    constructor(x: number, y: number, source: Ball, initialTarget: Ball, levels: number, time: number, reacquireTargetFn: (allyBalls: Ball[]) => Ball) {
        super({
            x, y,
            texture: 'aura',
            tint: 0xFFFF00,
            blendMode: Texture.BlendModes.ADD,
            scale: 0.1,
            layer: Battle.Layers.ui,
        });

        this.source = source;
        this.target = initialTarget;
        this.targetPt = this.target.getPosition();
        this.levels = levels;
        this.time = time;
        this.reacquireTargetFn = reacquireTargetFn;
    }

    onAdd() {
        this.world.playSound('sellball', { limit: 2 });

        let sendScript = this.runScript(sendTo(this.time, this, this.targetPt, Ball.Random.onCircle(100)));

        let levels = this.levels;
        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                for (let i = 0; i < levels; i++) {
                    this.target.levelUp(undefined, i === levels-1, false);
                }
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
    }

    private acquireTarget() {
        if (!this.reacquireTargetFn) return undefined;
        let allies = getAllies(this.world, this.source);
        return this.reacquireTargetFn(allies);
    }
}