class CircleImpact extends WorldObject {
    innerRadius: number;
    outerRadius: number;

    color = 0xFFFFFF;

    private damageTo: { ally: number, enemy: number };
    private radius: number;
    private source: Ball;

    constructor(x: number, y: number, radius: number, damageTo: { ally: number, enemy: number }, source: Ball) {
        super({
            x, y,
            layer: Battle.Layers.onground,
        });

        this.innerRadius = 0;
        this.outerRadius = radius;
        this.damageTo = damageTo;
        this.radius = radius;
        this.source = source;
    }

    onAdd(): void {
        super.onAdd();
        (global.theater ?? this.world).runScript(shake(this.world, 1, 0.1));

        let balls = this.world.select.typeAll(Ball);
        for (let ball of balls) {
            if (G.distance(this, ball) > this.radius + ball.physicalRadius) continue;
            if (ball.team === this.source.team && this.damageTo.ally !== 0) ball.takeDamage(this.damageTo.ally, this.source, 'other');
            if (ball.team !== this.source.team && this.damageTo.enemy !== 0) ball.takeDamage(this.damageTo.enemy, this.source, 'other');
        }

        this.runScript(S.chain(
            S.tween(0.2, this, 'innerRadius', 0, this.outerRadius, Tween.Easing.OutCubic),
            S.call(() => this.kill()),
        ));
    }

    render(texture: Texture, x: number, y: number): void {
        Draw.brush.color = this.color;
        Draw.brush.alpha = 1;
        Draw.annulusSolid(texture, x, y, this.innerRadius, this.outerRadius);

        super.render(texture, x, y);
    }
}