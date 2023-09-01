class FireExplosion extends Sprite {
    private radius: number;
    private burnTime: number;
    private source: Ball;

    constructor(x: number, y: number, radius: number, burnTime: number, source: Ball) {
        super({
            x, y,
            texture: new AnchoredTexture(Texture.filledCircle(radius, 0xFFFFFF), 0.5, 0.5),
            layer: Battle.Layers.fx,
        });

        this.radius = radius;
        this.burnTime = burnTime;
        this.source = source;

        this.runScript(S.chain(
            S.wait(0.1),
            S.call(() => this.tint = 0xFF8F00),
            S.wait(0.1),
            S.call(() => this.kill()),
        ));
    }

    onAdd() {
        super.onAdd();
        (global.theater ?? this.world).runScript(shake(this.world, 1, 0.1));

        let balls = this.world.select.typeAll(Ball);
        for (let ball of balls) {
            if (G.distance(this, ball) > this.radius + ball.physicalRadius) continue;
            if (ball.team === this.source.team) continue;
            ball.addBurning(this.source, this.burnTime);
        }
    }
}