namespace Balls {
    export class CueBall extends Ball {
        getName() { return 'Cue Ball'; }
        getDesc() { return `On enter battle, launch toward the closest ally. Bounces allies up to [lb]${this.bounceSpeedLimitPercent}%[/lb] max speed on collision`; }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }

        get extraMomentumFactor() { return 1 + 0.2 * (this.level - 1); }

        get bounceSpeedLimitPercent() { return 100 + 20*(this.level-1); }
        get bounceSpeedLimit() { return this.bounceSpeedLimitPercent/100; }

        private cue: Cue;

        constructor(config: Ball.Config) {
            super('balls/cueball', 8, config);

            this.cue = this.addChild(new Cue(() => CueBall.getClosestAlly(this, this.world)));

            this.addAbility('onEnterBattle', CueBall.onEnterBattle, { canActivateTwice: false });
        }

        onCollide(collision: Physics.Collision) {
            super.onCollide(collision);
            if (collision.other.obj instanceof Ball && collision.other.obj.team === this.team) {
                collision.other.obj.v.x += (collision.other.post_vx - collision.other.pre_vx) * this.extraMomentumFactor;
                collision.other.obj.v.y += (collision.other.post_vy - collision.other.pre_vy) * this.extraMomentumFactor;
                collision.other.obj.addBoostMaxSpeed(this, 'other', this.bounceSpeedLimit, this.bounceSpeedLimit, 1);
            }
        }

        canAccelerateOnEnter() {
            return !!CueBall.getClosestAlly(this, this.world);
        }

        private static onEnterBattle(source: CueBall, world: World) {
            CueBall.doBoost(source, world);
            if (source.shouldActivateAbilityTwice()) {
                source.doAfterTime(0.5, () => CueBall.doBoost(source, world));
            }
        }

        private static doBoost(source: CueBall, world: World) {
            if (!source.canAccelerateOnEnter()) return;

            let closestBall = CueBall.getClosestAlly(source, world);
            if (!closestBall) return;

            let initialSpeed = isFinite(source.maxSpeed) ? source.maxSpeed : 150;
            let f = closestBall.getPosition().subtract(source).normalize();
            source.v.set(f).scale(initialSpeed);

            world.playSound('cuehit', { humanized: false, limit: 2 });

            world.addWorldObject(new BurstPuffSystem({
                x: source.x,
                y: source.y,
                layer: Battle.Layers.fx,
                puffCount: Math.floor(6 * getParticleLevel()),
                puffConfigFactory: () => ({
                    maxLife: 0.5,
                    p: Random.inCircle(5),
                    v: f.scaled(-100).add(Random.onCircle(30)),
                    color: 0xFFFFFF,
                    radius: 4,
                    finalRadius: 0,
                }),
            }));

            if (source.cue) {
                source.removeChildKeepWorldPosition(source.cue);
                source.cue.fire();
                source.cue = undefined;
            }
        }

        private static getClosestAlly(source: CueBall, world: World) {
            if (!world) return undefined;
            if (source.isInShop || source.isInYourSquadScene) return undefined;
            let ballMover = world.select.type(BallMover, false);
            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.isInShop && ballMover?.movingThing !== ball);
            return M.argmin(validBalls, ball => G.distance(source, ball));
        }
    }

    class Cue extends Sprite {
        private getTarget: () => Pt;

        get parentCueBall() { return this.parent instanceof CueBall ? this.parent : undefined; }

        constructor(getTarget: () => Pt) {
            super({
                texture: 'cue',
                alpha: 0,
                effects: { outline: { color: 0x000000 } },
            });
            
            this.getTarget = getTarget;

            this.updatePosition();
            this.updateAlpha();
        }

        onAdd(): void {
            super.onAdd();
            if (this.world.getLayerByName(Battle.Layers.fx)) {
                this.layer = Battle.Layers.fx;
            }
        }

        update() {
            super.update();
            this.updatePosition();
            this.updateAlpha();
        }

        private updatePosition() {
            let parentBall = this.parentCueBall;
            let target = this.getTarget();
            if (!parentBall || !target) return;

            let angle = G.angle(parentBall, target) + 180;
            let distance = parentBall.visibleRadius + M.lerp(4, 7, Tween.Easing.OscillateSine(2)(this.life.time));

            this.localx = M.cos(angle) * distance;
            this.localy = M.sin(angle) * distance;
            this.angle = angle;
        }

        private updateAlpha() {
            let parentBall = this.parentCueBall;
            let targetAlpha = parentBall?.canAccelerateOnEnter() && parentBall?.state !== Ball.States.BATTLE ? 1 : 0;

            this.alpha = M.moveToClamp(this.alpha, targetAlpha, 4, this.delta);
            this.effects.outline.alpha = this.alpha;
        }

        fire() {
            let cue = this;
            let targetPos = Vector2.fromPolar(30, this.angle + 180).add(cue);
            this.runScript(function*() {
                yield [
                    S.tweenPt(0.15, cue, cue, targetPos, Tween.Easing.OutQuad),
                    S.tween(0.25, cue, 'alpha', 1, 0, Tween.Easing.InQuad),
                ];
                cue.kill();
            })
        }
    }
}