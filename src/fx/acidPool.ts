class AcidPool extends WorldObject {
    private source: Ball;
    private dmg: number;

    radius: number;

    constructor(x: number, y: number, source: Ball, radius: number, dmg: number) {
        super({
            x, y,
            layer: Battle.Layers.onground,
        });

        this.source = source;
        this.radius = radius;
        this.dmg = dmg;

        this.addChild(new StatViewer({ type: 'damage', getDamage: () => this.dmg }, 1, 1));

        let pool = this;
        this.runScript(function*() {
            yield S.tween(0.5, pool, 'radius', 0, radius);
            yield S.tween(15, pool, 'radius', radius, 0);
            pool.kill();
        });
    }

    update(): void {
        super.update();

        let validEnemies = getEnemies(this.world, this.source)
            .filter(enemy => G.distance(enemy, this) <= enemy.physicalRadius + this.radius);

        for (let enemy of validEnemies) {
            enemy.leechFor(this.dmg * this.delta, this.source);
        }
    }

    render(texture: Texture, x: number, y: number): void {
        let team = Ball.getTeamForColorAprilFools(this.source.team);
        let tint1 = team === 'enemy' ? 0x00FF00 : 0x4CFF7C;
        let tint2 = team === 'enemy' ? 0xAAFF00 : 0xAAFF5D;

        Draw.brush.color = Color.lerpColorByLch(tint1, tint2, Tween.Easing.OscillateSine(4)(this.life.time));
        Draw.brush.alpha = 1;
        Draw.circleSolid(texture, x, y, this.radius);

        super.render(texture, x, y);
    }
}