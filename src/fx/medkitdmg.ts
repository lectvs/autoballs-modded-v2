class MedkitDmg extends Sprite {
    private source: Ball;
    private damage: number;

    constructor(x: number, y: number, v: Vector2, source: Ball, damage: number) {
        super({
            x, y,
            texture: 'medkitdmg',
            effects: { post: { filters: [new BallTeamColorFilter(Ball.getTeamColor(source.team))] }},
            layer: Battle.Layers.onground,
            v: v,
            physicsGroup: Battle.PhysicsGroups.droppables,
            bounds: new CircleBounds(0, 0, 5),
        });

        this.source = source;
        this.damage = damage;

        this.addChild(new StatViewer({ type: 'damage', getDamage: () => this.damage }, 5, 4));
    }

    onAdd(): void {
        super.onAdd();
        this.world.playSound('spike');
    }

    update() {
        this.updatePull();
        PhysicsUtils.applyFriction(this.v, 100, 100, this.delta);
        this.setSpeed(M.clamp(this.getSpeed(), 0, 100));
        super.update();
        this.updateCollisions();
    }

    private updatePull() {
        let friendBalls = this.world.select.typeAll(Ball).filter(ball => ball.team === this.source.team && ball !== this.source);
        for (let ball of friendBalls) {
            if (G.distance(this, ball) > ball.physicalRadius + 12) continue;
            this.v.add(ball.getPosition().subtract(this).setMagnitude(100));
        }
    }

    private updateCollisions() {
        let collisions = this.world.select.overlap(this.bounds, [Battle.PhysicsGroups.balls]);
        let validBalls = <Ball[]>collisions.filter(ball => ball instanceof Ball && ball.team === this.source.team && ball !== this.source);
        if (validBalls.length === 0) return;

        let ball = validBalls[0];

        ball.buff(this.damage, 0);
        this.kill();
    }

    kill() {
        this.world.playSound('medkitgrab');
        this.world.playSound('buff');
        this.world.addWorldObject(newPuff(this.x, this.y, Battle.Layers.fx, 'small'));
        super.kill();
    }
}