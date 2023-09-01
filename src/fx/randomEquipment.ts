class RandomEquipment extends Sprite {
    private source: Ball;
    target: Ball;
    private targetPt: Pt;
    private equipmentType: number;
    private playSound: boolean;
    private reacquireTargetFn: (allies: Ball[]) => Ball;
    private onFail: () => void;

    constructor(x: number, y: number, source: Ball, initialTarget: Ball, equipmentType: number, playSound: boolean, reacquireTargetFn: (allies: Ball[]) => Ball, onFail: () => void) {
        super({
            x, y,
            texture: 'aura',
            tint: 0xFFFF00,
            blendMode: Texture.BlendModes.ADD,
            scale: 0.1,
            layer: Battle.Layers.ui,
        });

        this.addChild(new Sprite({
            texture: TYPE_TO_EQUIPMENT_TYPE_DEF[equipmentType].factory().getEquipmentTexture(),
            copyFromParent: ['layer'],
            update: function() {
                if (this.parent) World.Actions.orderWorldObjectBefore(this, this.parent);
            }
        }));

        this.source = source;
        this.target = initialTarget;
        this.targetPt = this.target.getPosition();
        this.equipmentType = equipmentType;
        this.playSound = playSound;
        this.reacquireTargetFn = reacquireTargetFn;
        this.onFail = onFail;
    }

    onAdd() {
        if (this.playSound) this.world.playSound('sellball', { limit: 2 });

        let sendScript = this.runScript(sendTo(0.7, this, this.targetPt, Ball.Random.onCircle(100)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                this.target.equip(this.equipmentType);
                if (this.life.time > 0.2) this.world?.playSound('buyball', { limit: 2 });
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
                this.onFail();
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