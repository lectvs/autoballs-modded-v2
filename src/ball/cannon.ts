namespace Balls {
    export class Cannon extends Ball {
        getName() { return 'Cannon'; }
        getDesc() { return `Shoots a [r]${this.cannonballDmg}<sword>[/r] cannonball at the closest enemy every ${this.cannonballShootTime}s`; }
        getShopDmg() { return 3; }
        getShopHp() { return 8; }
        getCredits() { return [CreditsNames.JUNJ]; }

        get cannonballDmg() { return this.level; }
        get cannonballSpeed() { return 300; }
        get cannonballShootTime() { return 1.5; }

        private gun: Sprite;
        private shootTime: number;

        constructor(config: Ball.Config) {
            super('balls/cannon', 11, config);

            this.gun = this.addChild(new Sprite({
                texture: getCannonTextureForAngleFrame(0, 0),
                copyFromParent: ['layer'],
                data: {
                    gunAngle: 0,
                    gunTime: 0,
                },
                update: function() {
                    this.data.gunTime = M.clamp(this.data.gunTime - 2*this.delta, 0, 1);
                    let frame = Math.ceil(M.lerp(2, 0, 1-this.data.gunTime));
                    this.setTexture(getCannonTextureForAngleFrame(this.data.gunAngle, frame))
                },
            }));

            this.shootTime = Ball.Random.float(this.cannonballShootTime/2, this.cannonballShootTime);

            this.addAbility('update', Cannon.update, { canActivateTwice: false });
        }
        
        postUpdate() {
            super.postUpdate();
            this.gun.alpha = this.alpha;
            this.gun.scale = this.ballScale * this.moveScale;
            World.Actions.orderWorldObjectAfter(this.gun, this);
        }

        private static update(source: Cannon, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let enemyBalls = getEnemies(world, source);
            let target = M.argmin(enemyBalls, ball => G.distance(source, ball));

            if (target) {
                let dx = target.x - source.x;
                let dy = target.y - source.y;

                let angle = M.atan2(dy, dx);
                source.gun.data.gunAngle = angle;

                if (world.select.raycast(source.x, source.y, dx, dy, [Battle.PhysicsGroups.walls]).some(coll => coll.t < 1)) {
                    source.shootTime = M.clamp(source.shootTime, 0, source.cannonballShootTime-0.5);
                }
            }

            source.shootTime += source.delta;
            while (source.shootTime >= source.cannonballShootTime) {
                Cannon.shoot(source, world);
                if (source.shouldActivateAbilityTwice()) {
                    source.doAfterTime(0.3, () => Cannon.shoot(source, world));
                }
                source.shootTime -= source.cannonballShootTime;
            }
        }

        private static shoot(source: Cannon, world: World) {
            source.gun.data.gunTime = 1;
            let d = Vector2.fromPolar(28, source.gun.data.gunAngle);
            let p = source.getPosition().add(d);

            let cannonball = world.addWorldObject(squadBallToWorldBall({
                x: p.x,
                y: p.y,
                properties: {
                    type: 54,
                    level: 1,
                    damage: source.cannonballDmg,
                    health: 1,
                    equipment: -1,
                    metadata: {},
                }
            }, undefined, -1, source.team));

            cannonball.v.set(d.withMagnitude(source.cannonballSpeed));
            cannonball.addBoostMaxSpeed(source, 'other', 3, 1, 1);

            cannonball.afterAddImmuneTime = 0;

            let puffd = d.normalized();
            world.addWorldObject(new BurstPuffSystem({
                x: source.x + 24*source.ballScale*puffd.x,
                y: source.y + 24*source.ballScale*puffd.y,
                layer: Battle.Layers.fx,
                puffCount: Math.floor(2 * getParticleLevel()),
                puffConfigFactory: () => ({
                    maxLife: 0.3,
                    v: vec2(puffd.x*50 + Random.float(-50, 50), puffd.y*50 + Random.float(-50, 50)),
                    color: 0xFFFFFF,
                    radius: 2,
                    finalRadius: 0,
                }),
            }));
            world.playSound('shootcannon');

            source.v.set(d.withMagnitude(-1.5*Ball.maxSpeedBase));
            source.addBoostMaxSpeed(source, 'other', 1.5, 1.33, 0.5);
        }
    }

    const CANNON_TEXTURE_N = 32;
    const cannonTextureCache: Texture[][] = [];
    function getCannonTextureForAngleFrame(angle: number, frame: number) {
        if (cannonTextureCache.length === 0) {
            let turretBaseTexture = AssetCache.getTexture('cannongunbase');
            let turretBarrelTextures = A.range(3).map(i => AssetCache.getTexture(`cannongunbarrel/${i}`));
            if (!turretBaseTexture || turretBarrelTextures.some(t => !t)) return undefined;
            let outlineFilter = new Effects.Filters.Outline(0x000000, 1);
            for (let i = 0; i < CANNON_TEXTURE_N; i++) {
                let angle = i * 360 / CANNON_TEXTURE_N;
                cannonTextureCache.push(A.range(3).map(i => {
                    let texture = new BasicTexture(44, 44, 'Cannon.getCannonTextureForAngleFrame');
                    turretBaseTexture.renderTo(texture, { x: 22, y: 22 });
                    turretBarrelTextures[i].renderTo(texture, { x: 22, y: 22, angle: angle });
                    return new AnchoredTexture(texture.transform({ filters: [outlineFilter] }, 'Cannon.getCannonTextureForAngleFrame'), 0.5, 0.5);
                }));
            }
        }

        let i = M.mod(Math.round(angle / 360 * CANNON_TEXTURE_N), CANNON_TEXTURE_N);
        return cannonTextureCache[i][frame];
    }
}