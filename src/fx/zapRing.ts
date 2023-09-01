class ZapRing extends WorldObject {
    radius: number;

    private random: RandomNumberGenerator;
    private randomOffset: number;

    constructor(radius: number, config: WorldObject.Config) {
        super(config);
        this.radius = radius;

        this.random = new RandomNumberGenerator();
        this.randomOffset = Random.float(0, 1);
    }

    render(texture: Texture, x: number, y: number): void {
        Draw.brush.color = 0x00FFFF;
        Draw.brush.alpha = 1;
        Draw.brush.thickness = 1;

        this.random.seed(Math.floor(this.randomOffset + this.life.time*16));

        let segments = 20;
        let firstRadius = this.radius + this.random.float(0, 4);
        let currentRadius = firstRadius;
        for (let i = 0; i < segments; i++) {
            let lastRadius = currentRadius;
            currentRadius = (i === segments-1 ? firstRadius : this.radius + this.random.float(0, 4));
            
            let lastAngle = i / segments * 360;
            let lastx = lastRadius * M.cos(lastAngle);
            let lasty = lastRadius * M.sin(lastAngle);

            let currentAngle = (i+1) / segments * 360;
            let currentx = currentRadius * M.cos(currentAngle);
            let currenty = currentRadius * M.sin(currentAngle);

            Draw.line(texture, x + lastx, y + lasty, x + currentx, y + currenty);
        }

        super.render(texture, x, y);
    }
}