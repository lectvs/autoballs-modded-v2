class WatermelonSplash extends WorldObject {
    innerRadius: number;
    outerRadius: number;

    private damageTo: Ball[];
    private radius: number;
    private damage: number;
    private source: Ball;

    constructor(x: number, y: number, radius: number, damage: number, damageTo: Ball[], source: Ball) {
        super({
            x, y,
            layer: Battle.Layers.onground,
        });

        this.innerRadius = 0;
        this.outerRadius = radius;
        this.damageTo = damageTo;
        this.radius = radius;
        this.damage = damage;
        this.source = source;
    }

    onAdd(): void {
        super.onAdd();
        (global.theater ?? this.world).runScript(shake(this.world, 1, 0.1));

        for (let ball of this.damageTo) {
            if (G.distance(this, ball) > this.radius + ball.physicalRadius) continue;
            ball.takeDamage(this.damage, this.source, 'other');
        }

        this.runScript(S.chain(
            S.tween(0.2, this, 'innerRadius', 0, this.outerRadius, Tween.Easing.OutCubic),
            S.call(() => this.kill()),
        ));
    }

    render(texture: Texture, x: number, y: number): void {
        Draw.brush.color = 0xFF0044;
        Draw.brush.alpha = 1;
        Draw.annulusSolid(texture, x, y, this.innerRadius, this.outerRadius);

        super.render(texture, x, y);
    }
}