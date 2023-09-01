class ClawSlash extends Sprite {
    private target: Ball;
    private source: Ball;
    private dmg: number;
    private foundTarget: boolean;

    tracking: boolean;

    constructor(target: Ball, source: Ball, dmg: number, tracking: boolean) {
        super({
            x: target.x, y: target.y,
            animations: [Animations.fromTextureList({ name: 'slash', textureRoot: 'clawslash', textures: [0, 1, 2, 3, 4, 5, 6, 7], frameRate: 32, count: 1 })],
            effects: { outline: { color: 0x000000 }},
            layer: Battle.Layers.fx,
            bounds: new CircleBounds(0, 0, 8),
        });

        this.target = target;
        this.source = source;
        this.dmg = dmg;
        this.foundTarget = false;
        this.tracking = tracking;
    }

    onAdd(): void {
        super.onAdd();
        
        if (this.target.world && !this.target.dead) {
            this.target.takeDamage(this.dmg, this.source, 'other');
            this.foundTarget = true;
        }

        this.runScript(S.chain(
            S.playAnimation(this, 'slash'),
            S.call(() => this.kill()),
        ));

        this.world.playSound('spike');
    }

    update() {
        super.update();

        if (!this.foundTarget && this.life.frames < 4) {
            let targets = getEnemies(this.world, this.source).filter(ball => ball.isOverlapping(this.bounds));
            let closestTarget = M.argmin(targets, ball => G.distance(ball, this));
            if (closestTarget) {
                this.target = closestTarget;
                this.target.takeDamage(this.dmg, this.source, 'other');
                this.foundTarget = true;
            }
        }
    }

    postUpdate(): void {
        super.postUpdate();

        if (this.tracking) {
            this.x = this.target.x;
            this.y = this.target.y;
        }
    }
}