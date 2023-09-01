class Zap extends WorldObject {
    start: Pt;
    end: Pt;

    private random: RandomNumberGenerator;
    private randomOffset: number;

    constructor(start: Pt, end: Pt) {
        super({
            layer: Battle.Layers.fx,
        });

        this.start = start;
        this.end = end;

        this.random = new RandomNumberGenerator();
        this.randomOffset = Random.float(0, 1);
    }

    getDamageMult() {
        return M.mapClamp(this.life.time, 0, 1, 1, 0.5);
    }

    render(texture: Texture, x: number, y: number): void {
        let distance = G.distance(this.start, this.end);
        let segments = Math.floor(distance / 4);

        let segmentD = vec2(this.end).subtract(this.start).withMagnitude(distance / segments);
        let segmentDInv = segmentD.rotated(90).normalize();

        Draw.brush.color = Color.lerpColorByRgb(0x00FFFF, 0x00A5A5, M.map(this.getDamageMult(), 1, 0.5, 0, 1));
        Draw.brush.alpha = 1;
        Draw.brush.thickness = 1;

        this.random.seed(Math.floor(this.randomOffset + this.life.time*16));

        let currentPoint: Vector2 = vec2(this.start);
        for (let i = 0; i < segments; i++) {
            let currentx = currentPoint.x;
            let currenty = currentPoint.y;

            let rd = this.random.float(-8, 8);

            let nextx = this.start.x + segmentD.x * (i+1) + segmentDInv.x * rd;
            let nexty = this.start.y + segmentD.y * (i+1) + segmentDInv.y * rd;
            
            Draw.line(texture, x + currentx, y + currenty, x + nextx, y + nexty);

            currentPoint.set(nextx, nexty);
        }

        super.render(texture, x, y);
    }
}