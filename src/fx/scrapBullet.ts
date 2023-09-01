/// <reference path="./projectile.ts" />

class ScrapBullet extends Projectile {
    private dmg: number;

    constructor(x: number, y: number, v: Vector2, source: Ball, dmg: number) {
        super(source, {
            x, y,
            texture: 'scrapbullet',
            layer: Battle.Layers.fx,
            v: v,
            vangle: Random.sign() * 360,
            bounds: new CircleBounds(0, 0, 4),
            tags: [Tags.DELAY_RESOLVE(source.team)],
        });

        this.dmg = dmg;

        this.addChild(new StatViewer({ type: 'damage', getDamage: () => this.dmg }, 6, 5));
    }

    update() {
        super.update();

        let collisions = this.world.select.overlap(this.bounds, [Battle.PhysicsGroups.balls, Battle.PhysicsGroups.walls]);

        let ball = <Ball>collisions.find(c => c instanceof Ball && c.team !== this.source.team);
        let wall = collisions.find(c => c.physicsGroup === Battle.PhysicsGroups.walls);

        if (ball) {
            ball.takeDamage(this.dmg, this.source, 'other');
            this.kill();
        } else if (wall) {
            this.world.playSound('hitwall');
            this.kill();
        }
    }

    kill() {
        this.world.addWorldObject(newPuff(this.x, this.y, Battle.Layers.fx, 'small'));
        super.kill();
    }
}