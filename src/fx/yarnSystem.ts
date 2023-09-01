type YarnSegment = {
    endpoint: Vector2;
    life: number;
    maxLife: number;
}

class YarnSystem extends Sprite {
    private parentBall: Balls.BallOfYarn;

    private startPoint: Vector2;
    private segments: YarnSegment[];
    private startDistance: number;

    private slowFactor: number;

    constructor(parentBall: Balls.BallOfYarn, startPoint: Vector2, slowFactor: number) {
        super();
        this.parentBall = parentBall;
        this.slowFactor = slowFactor;
        this.reset(startPoint);
    }

    addSegment(endpoint: Vector2, life: number) {
        this.segments.push({
            endpoint: vec2(endpoint),
            life: life,
            maxLife: life,
        });
    }

    update(): void {
        super.update();

        for (let segment of this.segments) {
            segment.life -= this.delta;
        }

        while (this.segments.length > 0 && this.segments[0].life <= 0) {
            let length = G.distance(this.startPoint, this.segments[0].endpoint);
            let k = Math.ceil((length - this.startDistance)/4);
            this.startDistance += 4*k - length;

            this.startPoint = this.segments[0].endpoint;
            this.segments.shift();
        }

        let enemies = this.world.select.typeAll(Ball).filter(ball => ball.team !== this.parentBall.team);
        for (let enemy of enemies) {
            for (let i = 0; i < this.segments.length; i++) {
                let start = (i === 0 ? this.startPoint : this.segments[i-1].endpoint);
                let end = this.segments[i].endpoint;
                if (G.circleIntersectsSegment(enemy.x, enemy.y, enemy.physicalRadius, start.x, start.y, end.x, end.y)) {
                    enemy.addSlow('yarn', this.slowFactor, 0.1);
                }
            }
        }

        if (this.segments.length === 0 && this.parentBall.world !== this.world) {
            this.kill();
        }
    }

    render(texture: Texture, x: number, y: number): void {
        let startSegment = Math.max(this.segments.length - 100, 0);

        Draw.brush.color = Ball.getTeamColor(this.parentBall.team);
        Draw.brush.alpha = 1;

        Draw.brush.thickness = IS_MOBILE ? 3 : 2;
        for (let i = startSegment; i < this.segments.length; i++) {
            Draw.brush.alpha = this.segments[i].life / this.segments[i].maxLife;
            let start = (i === 0 ? this.startPoint : this.segments[i-1].endpoint);
            let end = this.segments[i].endpoint;
            Draw.line(texture, start.x, start.y, end.x, end.y);
        }

        if (!IS_MOBILE) {
            Draw.brush.color = 0x000000;
            Draw.brush.thickness = 1;
            for (let i = startSegment; i < this.segments.length; i++) {
                Draw.brush.alpha = this.segments[i].life / this.segments[i].maxLife;
                let start = (i === 0 ? this.startPoint : this.segments[i-1].endpoint);
                let end = this.segments[i].endpoint;
                let bandDirection = vec2(end).subtract(start).rotate(90).normalize();

                Draw.line(texture, start.x - bandDirection.x, start.y - bandDirection.y, end.x - bandDirection.x, end.y - bandDirection.y);
                Draw.line(texture, start.x + bandDirection.x, start.y + bandDirection.y, end.x + bandDirection.x, end.y + bandDirection.y);
            }
        }

        super.render(texture, x, y);
    }

    setStartPointForBattle(startPoint: Vector2) {
        if (this.segments.length > 0) return;
        this.startPoint = vec2(startPoint);
        this.startDistance = 0;
    }
    
    reset(startPoint: Vector2) {
        this.startPoint = vec2(startPoint);
        this.segments = [];
        this.startDistance = 0;
    }
}