type ButterGlob = {
    position: Vector2;
    radius: number;
    attack: number;
    sustain: number;
    release: number;
    time: number;
}

class ButterSystem extends Sprite {
    private parentBall: Balls.Butterball;
    private moveSpeedFactor: number;
    private globs: ButterGlob[];

    constructor(parentBall: Balls.Butterball, moveSpeedFactor: number) {
        super();
        this.parentBall = parentBall;
        this.moveSpeedFactor = moveSpeedFactor;
        this.reset();
    }

    addGlob(position: Vector2, radius: number, attack: number, sustain: number, release: number) {
        this.globs.push({
            position: vec2(position),
            radius: radius,
            attack, sustain, release,
            time: 0,
        });
    }

    update(): void {
        super.update();

        this.globs = this.globs.filter(glob => {
            glob.time += this.delta;
            return glob.time < glob.attack + glob.sustain + glob.release;
        });

        let allies = this.world.select.typeAll(Ball).filter(ball => ball.team === this.parentBall.team && !(ball instanceof Balls.Butterball));
        for (let ally of allies) {
            for (let glob of this.globs) {
                if (G.distance(ally, glob.position) < ally.physicalRadius + glob.radius) {
                    ally.addBoostMaxSpeed(this.parentBall, 'other', this.moveSpeedFactor, this.moveSpeedFactor, 2);
                    ally.addScaleAcceleration(this.parentBall, this.moveSpeedFactor, 2);
                }
            }
        }

        if (this.globs.length === 0 && this.parentBall.world !== this.world) {
            this.kill();
        }
    }

    render(texture: Texture, x: number, y: number): void {
        let team = Ball.getTeamForColorAprilFools(this.parentBall ? this.parentBall.team : 'neutral');
        Draw.brush.color = team === 'enemy' ? 0xE4F1AE : 0xFFF1B5;
        Draw.brush.alpha = 1;

        for (let glob of this.globs) {
            let t = 0;
            if (glob.time < glob.attack) {
                t = M.lerp(0, 1, glob.time/glob.attack);
            } else if (glob.time - glob.attack < glob.sustain) {
                t = 1;
            } else {
                t = M.lerp(1, 0, (glob.time - glob.attack - glob.sustain)/glob.release);
            }
            Draw.circleSolid(texture, x + glob.position.x, y + glob.position.y, t*glob.radius);
        }

        super.render(texture, x, y);
    }

    reset() {
        this.globs = [];
    }
}