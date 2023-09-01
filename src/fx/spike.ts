/// <reference path="./projectile.ts" />

class Spike extends Projectile {
    private dmg: number;
    private hitCount: number;

    constructor(x: number, y: number, v: Vector2, source: Ball, dmg: number, hitCount: number) {
        super(source, {
            x, y,
            texture: 'spike',
            tint: Ball.getTeamColor(source.team),
            effects: { outline: { color: 0x000000 } },
            layer: Battle.Layers.fx,
            v: v,
            angle: v.angle + 90,
            life: 5,
            bounds: new CircleBounds(0, 0, 5),
            tags: [Tags.DELAY_RESOLVE(source.team)],
        });

        this.dmg = dmg;
        this.hitCount = hitCount;

        this.addChild(new StatViewer({ type: 'damage', getDamage: () => this.dmg }, 4, 3));
    }

    update(): void {
        super.update();

        let markedEnemies = getEnemies(this.world, this.source).filter(enemy => enemy.isMarked());

        if (markedEnemies.length > 0) {
            let targetFn = (enemies: Ball[]) => Ball.Random.element(enemies.filter(enemy => enemy.isMarked()));
            this.world.addWorldObject(new HomingSpike(this.x, this.y, this.source, targetFn(markedEnemies), this.dmg, this.hitCount, enemies => targetFn(enemies)));
            this.kill();
            return;
        }

        let balls = this.world.select.typeAll(Ball).filter(ball => ball.team !== this.source.team && ball.bounds.containsPoint(this));
        let walls = this.world.physicsGroups[Battle.PhysicsGroups.walls].worldObjects.filter(obj => obj.bounds.containsPoint(this));

        if (balls.length > 0 && this.life.time > 0.1) {
            for (let i = 0; i < this.hitCount; i++) {
                balls[0].takeDamage(this.dmg, this.source, 'other');
            }
            this.world.addWorldObject(new Explosion(this.x, this.y, 6, { ally: 0, enemy: 0 }));
            (global.theater ?? this.world).runScript(shake(this.world, 1, 0.1));
            this.kill();
        } else if (walls.length > 0) {
            this.world?.playSound('hitwall', { limit: 5 });
            this.world.addWorldObject(new Explosion(this.x, this.y, 6, { ally: 0, enemy: 0 }));
            this.kill();
        }
    }
}