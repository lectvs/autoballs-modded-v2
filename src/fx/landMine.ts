class LandMine extends Sprite {
    private source: Ball;
    private damage: number;

    constructor(x: number, y: number, v: Vector2, source: Ball, damage: number) {
        super({
            x, y,
            texture: 'landmine',
            animations: [
                Animations.fromTextureList({ name: 'blink', textureRoot: 'landmine', textures: [0, 1], frameRate: 8, count: Infinity }),
            ],
            effects: { post: { filters: [new BallTeamColorFilter(Ball.getTeamColor(source.team))] }},
            layer: Battle.Layers.onground,
            v: v,
            physicsGroup: Battle.PhysicsGroups.droppables,
            bounds: new CircleBounds(0, 0, 12),
            tags: [Tags.DELAY_RESOLVE(source.team)],
        });

        this.source = source;
        this.damage = damage;

        this.addChild(new StatViewer({ type: 'damage', getDamage: () => this.damage }, 5, 4));

        let mine = this;
        this.stateMachine.addState('idle', {
            script: S.wait(0.5),
            transitions: [{ toState: 'detonate', condition: () => this.isColliding() }],
        });
        this.stateMachine.addState('detonate', {
            callback: () => {
                this.addTag(Tags.DELAY_RESOLVE(source.team));
            },
            script: function*() {
                mine.world.playSound('beepbeep', { humanized: false });
                yield S.wait(0.125);
                mine.explode();
            },
            update: () => {
                mine.effects.silhouette.enabled = true;
                mine.effects.silhouette.color = 0xFFFFFF;
                mine.effects.silhouette.amount = mine.oscillateNSeconds(0.08) ? 1 : 0;
            }
        });
        this.setState('idle');

        this.addTimer(1, () => {
            if (this.state !== 'detonate') this.removeTag(Tags.DELAY_RESOLVE(source.team));
        });
    }

    onAdd(): void {
        super.onAdd();
        this.world.playSound('medkitout');
    }

    update() {
        PhysicsUtils.applyFriction(this.v, 100, 100, this.delta);
        this.setSpeed(M.clamp(this.getSpeed(), 0, 100));
        super.update();
    }

    private explode() {
        this.world.addWorldObject(new Explosion(this.x, this.y, 20, { ally: 0, enemy: this.damage }, this.source));
        this.world.playSound('shake');

        this.kill();
    }

    private isColliding() {
        let collisions = this.world.select.overlap(this.bounds, [Battle.PhysicsGroups.balls]);
        let validBalls = collisions.filter(ball => ball instanceof Ball && ball.team !== this.source.team);
        return validBalls.length > 0;
    }
}