class RandomBuff extends Sprite {
    private source: Ball;
    private target: Ball;
    private targetPt: Pt;
    private buff: { dmg: number, hp: number };
    private reacquireTargetFn: (allyBalls: Ball[]) => Ball;

    constructor(x: number, y: number, source: Ball, initialTarget: Ball, buff: { dmg: number, hp: number }, reacquireTargetFn: (allyBalls: Ball[]) => Ball) {
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
        this.buff = buff;
        this.reacquireTargetFn = reacquireTargetFn;
        
        this.addChild(new StatViewer({ type: 'buff', getDmg: () => this.buff.dmg, getHp: () => this.buff.hp }, 1, 1));
    }

    onAdd() {
        this.world.playSound('sellball', { limit: 2 });

        let sendScript = this.runScript(sendTo(0.7, this, this.targetPt, Ball.Random.onCircle(100)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                this.target.buff(this.buff.dmg, this.buff.hp);
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