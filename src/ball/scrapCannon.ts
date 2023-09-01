namespace Balls {
    export class ScrapCannon extends Ball {
        getName() { return 'Scrap Cannon'; }
        getDesc() {
            let fireRateColor = Color.lerpColorByRgb(0xFFFFFF, 0x00FF00, ScrapCannon.getPowerPercent(this));
            return `Shoots the closest enemy for [r]${this.bulletDmg}<sword>[/r] every \\[[color ${fireRateColor}]${this.currentShootTime.toFixed(1)}s[/color]\\]. Restocking the shop increases the fire rate`;
        }
        getShopDmg() { return 3; }
        getShopHp() { return 6; }
        getCredits() { return [CreditsNames.MATERWELONS]; }

        get bulletDmg() { return 1 + 0.5*(this.level-1); }
        get bulletSpeed() { return 200; }

        get shootTimeMin() { return 0.5; }
        get shootTimeMax() { return 1.5; }

        private static maxPower: number = 4;
        static getPowerPercent(source: Ball) { return M.mapClamp(source.properties.metadata.currentRoundPower, 0, this.maxPower, 0, 1); }
        get currentShootTime() { return M.lerp(this.shootTimeMax, this.shootTimeMin, ScrapCannon.getPowerPercent(this)); }

        private gun: Sprite;
        private powerFilter: PowerFilter;
        private shootTime: number;

        constructor(config: Ball.Config) {
            super('balls/scrapcannon', 8, config);

            if (this.properties.metadata.currentRoundPower === undefined) {
                this.properties.metadata.currentRoundPower = 0;
            }

            this.powerFilter = new PowerFilter(ScrapCannon.getPowerPercent(this));
            this.gun = this.addChild(new Sprite({
                texture: getCannonTextureForAngleFrame(0, 0),
                copyFromParent: ['layer'],
                effects: { post: { filters: [this.powerFilter] } },
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

            this.shootTime = Ball.Random.float(1, 1.5);

            this.addAbility('onStartShop', ScrapCannon.onStartShop, { nullifyable: false, canActivateTwice: false });
            this.addAbility('onRestock', ScrapCannon.onRestock);
            this.addAbility('update', ScrapCannon.update, { canActivateTwice: false });
        }

        postUpdate() {
            super.postUpdate();
            this.gun.alpha = this.alpha;
            this.gun.scale = this.ballScale * this.moveScale;
            World.Actions.orderWorldObjectAfter(this.gun, this);

            this.powerFilter.power = ScrapCannon.getPowerPercent(this);
        }

        levelUp(withProperties: SquadBallProperties, withFanfare?: boolean, withStatIncrease?: boolean): void {
            super.levelUp(withProperties, withFanfare, withStatIncrease);

            if (withProperties && withProperties !== this.properties) {
                this.properties.metadata.currentRoundPower = Math.max(this.properties.metadata.currentRoundPower, withProperties.metadata.currentRoundPower);
            }
        }

        static onStartShop(source: Ball, world: World) {
            source.properties.metadata.currentRoundPower = 0;
        }

        static onRestock(source: Ball, world: World) {
            if (!source.properties.metadata.currentRoundPower) source.properties.metadata.currentRoundPower = 0;

            if (source.properties.metadata.currentRoundPower >= ScrapCannon.maxPower) return;
            source.properties.metadata.currentRoundPower++;

            if (source instanceof ScrapCannon) {
                source.shootTime = source.currentShootTime - Ball.Random.float(0, 0.5);
            }

            world.playSound('charge', { humanized: false, speed: pitch(2*source.properties.metadata.currentRoundPower-1) });

            if (ScrapCannon.getPowerPercent(source) >= 1) {
                world.playSound('medkitheal', { humanized: false, speed: 1.5 });
            }
        }

        private static update(source: ScrapCannon, world: World) {
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
            while (source.shootTime >= source.currentShootTime) {
                ScrapCannon.shoot(source, world);
                if (source.shouldActivateAbilityTwice()) {
                    source.doAfterTime(0.1, () => ScrapCannon.shoot(source, world));
                }
                source.shootTime -= source.currentShootTime;
            }
        }

        private static shoot(source: ScrapCannon, world: World) {
            source.gun.data.gunTime = 1;
            let d = Vector2.fromPolar(1, source.gun.data.gunAngle);
            let v = d.withMagnitude(source.bulletSpeed);
            world.addWorldObject(new ScrapBullet(source.x + 12*d.x, source.y + 12*d.y, v, source, source.bulletDmg));
            world.addWorldObject(new BurstPuffSystem({
                x: source.x + 12*source.ballScale*d.x,
                y: source.y + 12*source.ballScale*d.y,
                layer: Battle.Layers.fx,
                puffCount: Math.floor(2 * getParticleLevel()),
                puffConfigFactory: () => ({
                    maxLife: 0.3,
                    v: vec2(v.x/2 + Random.float(-50, 50), v.y/2 + Random.float(-50, 50)),
                    color: 0x333333,
                    radius: 2,
                    finalRadius: 0,
                }),
            }));
            world.playSound('scrap', { humanized: false }).speed = Random.float(0.95, 1.05);
            source.didShootProjectile(1);
        }
    }

    const CANNON_TEXTURE_N = 32;
    const cannonTextureCache: Texture[][] = [];
    function getCannonTextureForAngleFrame(angle: number, frame: number) {
        if (cannonTextureCache.length === 0) {
            let baseTexture = AssetCache.getTexture('scrapgunbase');
            let barrelTextures = A.range(3).map(i => AssetCache.getTexture(`scrapgunbarrel/${i}`));
            if (!baseTexture || barrelTextures.some(t => !t)) return undefined;
            let outlineFilter = new Effects.Filters.Outline(0x000000, 1);
            for (let i = 0; i < CANNON_TEXTURE_N; i++) {
                let angle = i * 360 / CANNON_TEXTURE_N;
                cannonTextureCache.push(A.range(3).map(i => {
                    let texture = new BasicTexture(32, 32, 'ScrapCannon.getCannonTextureForAngleFrame');
                    baseTexture.renderTo(texture, { x: 16, y: 16 });
                    barrelTextures[i].renderTo(texture, { x: 16, y: 16, angle: angle });
                    return new AnchoredTexture(texture.transform({ filters: [outlineFilter] }, 'ScrapCannon.getCannonTextureForAngleFrame'), 0.5, 0.5);
                }));
            }
        }

        let i = M.mod(Math.round(angle / 360 * CANNON_TEXTURE_N), CANNON_TEXTURE_N);
        return cannonTextureCache[i][frame];
    }

    class PowerFilter extends TextureFilter {
        set power(v: number) { this.setUniform('power', v); }

        constructor(power: number) {
            super({
                uniforms: { 'float power': power },
                code: `
                    if (inp.r < 0.01 && inp.g > 0.99) {
                        float powerRequired = mapClamp(inp.b, 0.0, 136.0/255.0, 0.0, 1.0);
                        float amount = step(powerRequired, power);
                        outp.rgb = vec3(0.0, lerp(0.0, 1.0, amount), 0.0);

                        float fullPowerAmount = step(0.99, power);
                        outp.rgb = lerp(outp.rgb, vec3(1.0, 1.0, 1.0), fullPowerAmount * (sin(12.0*t)+1.0)/2.0);
                    }
                `
            });
        }
    }

    function pitch(n: number) {
        return Math.pow(2, [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24][n-1] / 12);
    }
}