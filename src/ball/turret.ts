namespace Balls {
    export class Turret extends Ball {
        getName() { return 'Turret'; }
        getDesc() { return `Shoots the closest enemy for [r]${this.bulletDmg}<sword>/s[/r]`; }
        getShopDmg() { return 2; }
        getShopHp() { return 5; }

        get bulletDmg() { return this.level; }
        get bulletSpeed() { return 300; }

        private gun: Sprite;
        private shootTime: number;

        constructor(config: Ball.Config) {
            super('balls/turret', 8, config);

            this.gun = this.addChild(new Sprite({
                texture: getTurretTextureForAngleFrame(0, 0),
                copyFromParent: ['layer'],
                data: {
                    gunAngle: 0,
                    gunTime: 0,
                },
                update: function() {
                    this.data.gunTime = M.clamp(this.data.gunTime - 2*this.delta, 0, 1);
                    let frame = Math.ceil(M.lerp(2, 0, 1-this.data.gunTime));
                    this.setTexture(getTurretTextureForAngleFrame(this.data.gunAngle, frame))
                },
            }));

            this.shootTime = Ball.Random.float(0.5, 1);

            this.addAbility('update', Turret.update, { canActivateTwice: false });
        }
        
        postUpdate() {
            super.postUpdate();
            this.gun.alpha = this.alpha;
            this.gun.scale = this.ballScale * this.moveScale;
            World.Actions.orderWorldObjectAfter(this.gun, this);
        }

        private static update(source: Turret, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let enemyBalls = getEnemies(world, source);
            let target = M.argmin(enemyBalls, ball => G.distance(source, ball));

            if (target) {
                let dx = target.x - source.x;
                let dy = target.y - source.y;

                let angle = M.atan2(dy, dx);
                source.gun.data.gunAngle = angle;

                if (world.select.raycast(source.x, source.y, dx, dy, [Battle.PhysicsGroups.walls]).some(coll => coll.t < 1)) {
                    source.shootTime = M.clamp(source.shootTime, 0, 0.5);
                }
            }

            source.shootTime += source.delta;
            while (source.shootTime >= 1) {
                Turret.shoot(source, world);
                if (source.shouldActivateAbilityTwice()) {
                    source.doAfterTime(0.1, () => Turret.shoot(source, world));
                }
                source.shootTime -= 1;
            }
        }

        private static shoot(source: Turret, world: World) {
            source.gun.data.gunTime = 1;
            let d = Vector2.fromPolar(1, source.gun.data.gunAngle);
            let v = d.withMagnitude(source.bulletSpeed);
            world.addWorldObject(new TurretBullet(source.x + 12*d.x, source.y + 12*d.y, v, source, source.bulletDmg, 1));
            world.addWorldObject(new BurstPuffSystem({
                x: source.x + 12*source.ballScale*d.x,
                y: source.y + 12*source.ballScale*d.y,
                layer: Battle.Layers.fx,
                puffCount: Math.floor(2 * getParticleLevel()),
                puffConfigFactory: () => ({
                    maxLife: 0.3,
                    v: vec2(v.x/2 + Random.float(-50, 50), v.y/2 + Random.float(-50, 50)),
                    color: 0xFFFFFF,
                    radius: 2,
                    finalRadius: 0,
                }),
            }));
            world.playSound('shoot', { humanized: false }).speed = Random.float(0.95, 1.05);
            source.didShootProjectile(1);
        }
    }

    const TURRET_TEXTURE_N = 32;
    const turretTextureCache: Texture[][] = [];
    function getTurretTextureForAngleFrame(angle: number, frame: number) {
        if (turretTextureCache.length === 0) {
            let turretBaseTexture = AssetCache.getTexture('turretgunbase');
            let turretBarrelTextures = A.range(3).map(i => AssetCache.getTexture(`turretgunbarrel/${i}`));
            if (!turretBaseTexture || turretBarrelTextures.some(t => !t)) return undefined;
            let outlineFilter = new Effects.Filters.Outline(0x000000, 1);
            for (let i = 0; i < TURRET_TEXTURE_N; i++) {
                let angle = i * 360 / TURRET_TEXTURE_N;
                turretTextureCache.push(A.range(3).map(i => {
                    let texture = new BasicTexture(32, 32, 'Turret.getTurretTextureForAngleFrame');
                    turretBaseTexture.renderTo(texture, { x: 16, y: 16 });
                    turretBarrelTextures[i].renderTo(texture, { x: 16, y: 16, angle: angle });
                    return new AnchoredTexture(texture.transform({ filters: [outlineFilter] }, 'Turret.getTurretTextureForAngleFrame'), 0.5, 0.5);
                }));
            }
        }

        let i = M.mod(Math.round(angle / 360 * TURRET_TEXTURE_N), TURRET_TEXTURE_N);
        return turretTextureCache[i][frame];
    }
}