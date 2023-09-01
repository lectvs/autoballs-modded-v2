class HomingSap extends Sprite {
    team: Ball.Team;
    target: Ball;
    private targetPt: Pt;

    constructor(x: number, y: number, team: Ball.Team, initialTarget: Ball) {
        super({
            x, y,
            texture: 'sap',
            effects: { outline: { color: 0x000000 } },
            layer: Battle.Layers.fx,
        });

        this.team = team;
        this.target = initialTarget;
        this.targetPt = this.target.getPosition();
    }

    onAdd() {
        this.world.playSound('spike', { limit: 2 });
            
        let sendScript = this.runScript(sendTo(1, this, this.targetPt, Ball.Random.onCircle(150)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (this.life.time > 0.5 && G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                this.target?.breakEquipment();
                (global.theater ?? this.world)?.runScript(shake(this.world, 1, 0.1));
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
        let enemies = this.world.select.typeAll(Ball).filter(ball => ball.team !== this.team && ball.equipment);
        return Ball.Random.element(enemies);
    }
}