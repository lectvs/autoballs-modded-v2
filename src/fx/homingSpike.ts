/// <reference path="./projectile.ts" />

class HomingSpike extends Projectile {
    private target: Ball;
    private targetPt: Pt;
    private dmg: number;
    private hitCount: number;
    private reacquireTargetFn: (enemyBalls: Ball[]) => Ball;

    constructor(x: number, y: number, source: Ball, initialTarget: Ball, dmg: number, hitCount: number, reacquireTargetFn: (enemyBalls: Ball[]) => Ball) {
        super(source, {
            x, y,
            texture: 'spike',
            tint: Ball.getTeamColor(source.team),
            effects: { outline: { color: 0x000000 } },
            layer: Battle.Layers.fx,
            bounds: new CircleBounds(0, 0, 5),
            tags: [Tags.DELAY_RESOLVE(source.team)],
        });

        this.target = initialTarget;
        this.targetPt = this.target.getPosition();
        this.dmg = dmg;
        this.hitCount = hitCount;
        this.reacquireTargetFn = reacquireTargetFn;

        this.addChild(new StatViewer({ type: 'damage', getDamage: () => this.dmg }, 4, 3));
    }

    onAdd() {
        this.world.playSound('spike', { limit: 2 });
            
        let sendScript = this.runScript(sendTo(1, this, this.targetPt, Ball.Random.onCircle(150)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (this.life.time > 0.5 && G.distance(this, this.target) < this.target.radius)),
            S.call(() => {
                for (let i = 0; i < this.hitCount; i++) {
                    this.target?.takeDamage(this.dmg, this.source, 'other');
                }
                this.world.addWorldObject(new Explosion(this.x, this.y, 6, { ally: 0, enemy: 0 }));
                (global.theater ?? this.world)?.runScript(shake(this.world, 1, 0.1));
                this.kill();
            }),
        ));
    }

    update(): void {
        let markedEnemies = getEnemies(this.world, this.source).filter(enemy => enemy.isMarked());

        if (markedEnemies.length > 0 && !this.target?.isMarked()) {
            this.target = Ball.Random.element(markedEnemies);
        }

        if (!this.target.world) {
            let newTarget = this.acquireTarget();
            if (newTarget) {
                this.target = newTarget;
            } else {
                this.kill();
            }
        }

        this.targetPt.x = this.target.x;
        this.targetPt.y = this.target.y;

        super.update();
        this.angle = M.atan2(this.y - this.lasty, this.x - this.lastx) + 90;
    }

    private acquireTarget() {
        if (!this.reacquireTargetFn) return undefined;
        let enemies = getEnemies(this.world, this.source);
        return this.reacquireTargetFn(enemies);
    }
}