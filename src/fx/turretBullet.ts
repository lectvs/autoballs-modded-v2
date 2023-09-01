/// <reference path="./projectile.ts" />

class TurretBullet extends Projectile {
    private dmg: number;
    private hitCount: number;

    constructor(x: number, y: number, v: Vector2, source: Ball, dmg: number, hitCount: number) {
        super(source, {
            x, y,
            texture: Texture.filledCircle(2, 0x888888),
            effects: { outline: { color: 0x000000 } },
            layer: Battle.Layers.fx,
            v: v,
            bounds: new CircleBounds(0, 0, 3),
            tags: [Tags.DELAY_RESOLVE(source.team)],
        });

        this.dmg = dmg;
        this.hitCount = hitCount;

        this.addChild(new StatViewer({ type: 'damage', getDamage: () => this.dmg }, 6, 5));
    }

    update() {
        super.update();

        let physicsGroups = [Battle.PhysicsGroups.balls, Battle.PhysicsGroups.walls];

        let collisions = this.world.select.overlap(this.bounds, physicsGroups);
        let raycastCollisions = this.world.select.raycast(this.lastx, this.lasty, this.x - this.lastx, this.y - this.lasty, physicsGroups).filter(r => 0 <= r.t && r.t <= 1).map(r => r.obj);

        collisions.push(...raycastCollisions);
        A.removeDuplicates(collisions);

        let ball = <Ball>collisions.find(c => c instanceof Ball && c.team !== this.source.team && c.alive && !c.dead);
        let wall = collisions.find(c => c.physicsGroup === Battle.PhysicsGroups.walls);

        if (ball) {
            for (let i = 0; i < this.hitCount; i++) {
                ball.takeDamage(this.dmg, this.source, 'other');
            }
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