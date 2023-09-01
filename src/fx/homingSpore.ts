class HomingSpore extends Sprite {
    private source: Ball;
    target: Ball;
    private targetPt: Pt;

    constructor(x: number, y: number, source: Ball, target: Ball) {
        super({
            x, y,
            texture: 'aura',
            tint: 0x00FF21,
            blendMode: Texture.BlendModes.ADD,
            scale: 0.1,
            layer: Battle.Layers.ui,
        });

        this.source = source;
        this.target = target;
        this.targetPt = this.target.getPosition();
    }

    onAdd() {
        this.world.playSound('spike', { limit: 2 });

        let sendScript = this.runScript(sendTo(0.7, this, this.targetPt, Ball.Random.onCircle(100)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                this.target?.equip(14);
                this.world?.playSound('steal', { limit: 2 });
                this.kill();
            }),
        ));
    }

    update(): void {
        if (!this.target.world) {
            this.kill();
        }

        this.targetPt.x = this.target.x;
        this.targetPt.y = this.target.y;

        super.update();
    }
}