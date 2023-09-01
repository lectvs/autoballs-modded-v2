class Spinner extends WorldObject {
    alpha: number = 1;
    angle: number = 0;

    private ballRadius: number;
    private ballDistance: number;

    constructor(x: number, y: number, ballRadius: number, ballDistance: number) {
        super({ x, y });
        this.ballRadius = ballRadius;
        this.ballDistance = ballDistance;
    }

    update() {
        super.update();
        this.angle += 360 * this.delta;
    }

    render(texture: Texture, x: number, y: number) {
        super.render(texture, x, y);

        Draw.brush.color = 0xFFFFFF;
        Draw.brush.alpha = this.alpha;

        let n = 5;
        for (let i = 0; i < n; i++) {
            let dx = M.cos(this.angle + i * 360 / n) * this.ballDistance;
            let dy = M.sin(this.angle + i * 360 / n) * this.ballDistance;
            Draw.circleSolid(texture, x + dx, y + dy, this.ballRadius);
        }
    }
}