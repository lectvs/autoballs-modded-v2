class HomingItem extends Sprite {
    target: Ball;
    private targetPt: Pt;

    item: BallItem;

    constructor(x: number, y: number, target: Ball, item: BallItem) {
        super({
            x, y,
            texture: 'aura',
            tint: 0xFFFFFF,
            alpha: 0.7,
            blendMode: Texture.BlendModes.ADD,
            scale: 20 / 64,
            layer: Battle.Layers.ui,
        });

        this.target = target;
        this.targetPt = this.target.getPosition();
        this.item = item;

        this.addChild(item);
        item.localx = 0;
        item.localy = 0;
    }

    onAdd() {
        this.world.playSound('sellball', { limit: 2 });

        let sendScript = this.runScript(sendTo(0.7, this, this.targetPt, Ball.Random.onCircle(100)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                if (this.target && this.item.canApplyToBall(this.target)) {
                    this.target.useItem(this.item);
                    this.world.playSound('buyball');
                } else {
                    this.world.playSound('error', { humanized: false });
                    this.world.addWorldObject(new BallMoverError(this.x, this.y, 'CANNOT APPLY'));
                }
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

    postUpdate(): void {
        super.postUpdate();
        World.Actions.orderWorldObjectBefore(this.item, this);
    }
}