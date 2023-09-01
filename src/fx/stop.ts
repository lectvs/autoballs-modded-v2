class Stop extends WorldObject {
    alpha: number;

    private radius: number;
    private source: Balls.Stopper;

    constructor(x: number, y: number, radius: number, source: Balls.Stopper) {
        super({
            x, y,
            layer: Battle.Layers.onground,
        });

        this.alpha = 0.7;
        this.radius = radius;
        this.source = source;

        let stop = this;
        this.runScript(function*() {
            yield S.tween(0.5, stop, 'alpha', 0.7, 0);
            stop.kill();
        });
    }

    postUpdate(): void {
        super.postUpdate();

        this.x = this.source.x;
        this.y = this.source.y;
    }

    render(texture: Texture, x: number, y: number): void {
        Draw.brush.color = 0xFF0000;
        Draw.brush.alpha = this.alpha;
        Draw.brush.thickness = 1;

        let vertices = G.generatePolygonVertices(x, y, this.radius, 8);
        Draw.polygonSolid(texture, vertices);

        super.render(texture, x, y);
    }
}