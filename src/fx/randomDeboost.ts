class RandomDeboost extends Sprite {
    target: Ball;
    private source: Ball;
    private targetPt: Pt;
    private time: number;
    private reacquireTargetFn: (allyBalls: Ball[]) => Ball;

    constructor(x: number, y: number, source: Ball, initialTarget: Ball, time: number, reacquireTargetFn: (enemyBalls: Ball[]) => Ball) {
        super({
            x, y,
            texture: 'aura',
            tint: 0xFF0000,
            blendMode: Texture.BlendModes.ADD,
            scale: 0.1,
            layer: Battle.Layers.ui,
        });

        this.source = source;
        this.target = initialTarget;
        this.targetPt = this.target.getPosition();
        this.time = time;
        this.reacquireTargetFn = reacquireTargetFn;
    }

    onAdd() {
        this.world.playSound('sellball', { limit: 2 });

        let sendScript = this.runScript(sendTo(this.time, this, this.targetPt, Ball.Random.onCircle(100)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                this.target.levelDown();

                this.target.addChild(new Sprite({
                    texture: 'reduce',
                    copyFromParent: ['layer'],
                    offsetY: -4,
                    life: 1,
                    update: function() {
                        this.offsetY = M.lerp(-4, 4, this.life.progress);
                        this.alpha = M.jumpParabola(0, 1, 0, this.life.progress);
                        World.Actions.orderWorldObjectAfter(this, this.parent);
                    },
                }));

                this.kill();

                this.world?.playSound('shake2', { humanized: false, limit: 3, volume: 0.4 });
                this.world?.playSound('reduce', { humanized: false, limit: 3 });
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
        let enemies = getEnemies(this.world, this.source);
        return this.reacquireTargetFn(enemies);
    }
}