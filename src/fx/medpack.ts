class Medpack extends Sprite {
    private source: Ball;
    private health: number;

    constructor(x: number, y: number, v: Vector2, source: Ball, health: number) {
        super({
            x, y,
            texture: 'medkit',
            effects: { post: { filters: [new BallTeamColorFilter(Ball.getTeamColor(source.team))] }},
            layer: Battle.Layers.onground,
            v: v,
            physicsGroup: Battle.PhysicsGroups.droppables,
            bounds: new CircleBounds(0, 0, 5),
        });

        this.source = source;
        this.health = health;

        this.addChild(new StatViewer({ type: 'heal', getHealth: () => this.health }, 5, 4));
    }

    onAdd(): void {
        super.onAdd();
        this.world.playSound('medkitout');
    }

    update() {
        this.updatePull();
        PhysicsUtils.applyFriction(this.v, 100, 100, this.delta);
        this.setSpeed(M.clamp(this.getSpeed(), 0, 100));
        super.update();
        this.updateCollisions();
    }

    private updatePull() {
        let friendBalls = this.world.select.typeAll(Ball).filter(ball => ball.team === this.source.team && ball.hp < ball.maxhp && !(ball instanceof Balls.Medic));
        for (let ball of friendBalls) {
            if (G.distance(this, ball) > ball.physicalRadius + 12) continue;
            this.v.add(ball.getPosition().subtract(this).setMagnitude(100));
        }
    }

    private updateCollisions() {
        let collisions = this.world.select.overlap(this.bounds, [Battle.PhysicsGroups.balls]);
        let validBalls = <Ball[]>collisions.filter(ball => ball instanceof Ball && ball.team === this.source.team && ball.hp < ball.maxhp && !(ball instanceof Balls.Medic));
        if (validBalls.length === 0) return;

        let ball = validBalls[0];

        ball.healFor(this.health, this.source);
        this.world.playSound('medkitgrab');
        this.world.playSound('medkitheal');
        this.kill();
    }

    kill() {
        this.world.addWorldObject(newPuff(this.x, this.y, Battle.Layers.fx, 'small'));
        super.kill();
    }
}