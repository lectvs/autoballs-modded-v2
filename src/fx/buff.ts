class Buff extends Sprite {
    target: Ball;
    private targetPt: Pt;
    private buff: { dmg: number, hp: number };
    private initialVelocity: Vector2;

    constructor(x: number, y: number, initialTarget: Ball, buff: { dmg: number, hp: number }, initialVelocity?: Vector2) {
        super({
            x, y,
            texture: 'aura',
            tint: 0xFFFF00,
            blendMode: Texture.BlendModes.ADD,
            scale: 0.1,
            layer: Battle.Layers.ui,
        });

        this.target = initialTarget;
        this.targetPt = this.target.getPosition();
        this.buff = buff;
        this.initialVelocity = initialVelocity ? vec2(initialVelocity) : Ball.Random.onCircle(100);

        this.addChild(new StatViewer({ type: 'buff', getDmg: () => this.buff.dmg, getHp: () => this.buff.hp }, 1, 1));
    }

    onAdd() {
        this.world.playSound('sellball', { limit: 2 });

        let sendScript = this.runScript(sendTo(0.5, this, this.targetPt, this.initialVelocity));

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
            this.kill();
        }

        this.targetPt.x = this.target.x;
        this.targetPt.y = this.target.y;

        super.update();
    }
}