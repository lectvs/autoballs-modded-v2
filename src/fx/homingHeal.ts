class HomingHeal extends Sprite {
    target: Ball;
    private source: Ball;
    private targetPt: Pt;
    private healAmount: number;
    private reacquireTargetFn: (allyBalls: Ball[]) => Ball;

    constructor(x: number, y: number, source: Ball, initialTarget: Ball, healAmount: number, reacquireTargetFn: (allyBalls: Ball[]) => Ball) {
        super({
            x, y,
            texture: 'aura',
            tint: 0x00FF00,
            blendMode: Texture.BlendModes.ADD,
            scale: 0.1,
            layer: Battle.Layers.ui,
        });

        this.source = source;
        this.target = initialTarget;
        this.targetPt = this.target.getPosition();
        this.healAmount = healAmount;
        this.reacquireTargetFn = reacquireTargetFn;

        this.addChild(new StatViewer({ type: 'heal', getHealth: () => this.healAmount }, 1, 1));
    }

    onAdd() {
        this.world.playSound('sellball', { limit: 2 });
            
        let sendScript = this.runScript(sendTo(1, this, this.targetPt, Ball.Random.onCircle(150)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (this.life.time > 0.5 && G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                this.target?.healFor(this.healAmount, this.source);
                this.world?.playSound('medkitheal', { limit: 2 });
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
        let enemies = this.world.select.typeAll(Ball).filter(ball => ball.team === this.source.team);
        return this.reacquireTargetFn(enemies);
    }
}