namespace Balls {
    export class Stinger extends Ball {
        getName() { return 'Stinger'; }
        getDesc() { return `The first enemy stung is slowed by ${this.slowFactorPercent}% and takes [r]${this.totalStingerDamage}<sword>[/r] over ${this.stingDuration}s`; }
        getShopDmg() { return 1; }
        getShopHp() { return 6; }
        getShopRelativePosition() { return vec2(0, 2); }
        getCredits() { return [CreditsNames.XIAOSLOTH]; }

        get slowFactorPercent() { return M.clamp(20 + 10*(this.level-1), 0, 100); }
        get slowFactor() { return this.slowFactorPercent/100; }
        get totalStingerDamage() { return 5 + 2*(this.level-1); }
        get stingDuration() { return 3; }

        private stinger: Sprite;

        constructor(config: Ball.Config) {
            super('balls/stinger', 8, config);

            this.stinger = this.addChild(new Sprite({
                x: 0, y: -12,
                texture: 'stingerspike',
                copyFromParent: ['layer'],
                angle: -90,
                bounds: new CircleBounds(0, 0, 6),
                effects: { outline: { color: 0x000000 } },
            }));

            this.addAbility('update', Stinger.update, { canActivateTwice: false });
        }

        postUpdate() {
            super.postUpdate();

            if (this.stinger?.world) {
                this.stinger.alpha = this.alpha;
                this.stinger.scale = this.ballScale * this.moveScale;
                World.Actions.orderWorldObjectBefore(this.stinger, this);
            }
        }

        private static update(source: Stinger, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            if (!source.stinger || !source.stinger.world) return;

            let targetAngle = source.angle - 90;
            source.stinger.angle = M.moveToAngleClamp(source.stinger.angle, targetAngle, 360, source.delta);

            let d = Vector2.fromPolar(12, source.stinger.angle);
            source.stinger.localx = d.x * source.stinger.scaleX;
            source.stinger.localy = d.y * source.stinger.scaleY;

            let enemies = getEnemies(world, source);
            for (let enemy of enemies) {
                if (!source.stinger.bounds.isOverlapping(enemy.bounds)) continue;

                if (source.shouldActivateAbilityTwice()) {
                    Stinger.sting(source, enemy, -15);
                    Stinger.sting(source, enemy, 15);
                } else {
                    Stinger.sting(source, enemy, 0);
                }


                world.playSound('stab');
                world.addWorldObject(newPuff(source.stinger.x, source.stinger.y, Battle.Layers.fx, 'small'));

                source.stinger.kill();
                break;
            }
        }

        private static sting(source: Stinger, enemy: Ball, angleOffset: number) {
            enemy.addSlow('other', source.slowFactor, source.stingDuration);
            enemy.addSpreadDamage(source, source.totalStingerDamage, source.stingDuration);
            enemy.addChild(new Sting(enemy, source, source.stingDuration, angleOffset));
        }
    }

    class Sting extends Sprite {
        private ballParent: Ball;
        private dAngle: number;

        constructor(parent: Ball, source: Ball, life: number, angleOffset: number) {
            super({
                texture: 'stingerspike',
                copyFromParent: ['layer'],
                effects: { outline: { color: 0x000000 } },
                life: life,
            });

            this.ballParent = parent;

            this.dAngle = source.getPosition().subtract(parent).angle - parent.angle + angleOffset;
            this.updateTransform();
        }

        postUpdate(): void {
            super.postUpdate();
            this.updateTransform();
            World.Actions.orderWorldObjectBefore(this, this.ballParent);
        }

        kill(): void {
            this.world?.addWorldObject(newPuff(this.x, this.y, Battle.Layers.fx, 'small'));
            super.kill();
        }

        private updateTransform() {
            let angle = this.ballParent.angle + this.dAngle;
            this.angle = angle - 180;
            
            let localPos = Vector2.fromPolar(this.ballParent.physicalRadius, angle);
            this.localx = localPos.x;
            this.localy = localPos.y;
        }
    }
}