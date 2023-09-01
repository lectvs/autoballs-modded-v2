namespace Balls {
    export class BallOfYarn extends Ball {
        getName() { return 'Ball Of Yarn'; }
        getDesc() { return `Slows enemies by ${this.slowFactorPercent}% for [lb]${this.collisionSlowTime}s[/lb] on collision. Leaves a trail of yarn lasting [lb]${this.yarnLife}s[/lb] which also slows enemies`; }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }

        get slowFactorPercent() { return 50; }
        get slowFactor() { return this.slowFactorPercent/100; }
        get yarnLife() { return this.level; }
        get collisionSlowTime() { return this.level/2; }

        private tail: Sprite;
        private yarnSystem: YarnSystem;
        private yarnTime: number;
        private yarnDistance: number;

        constructor(config: Ball.Config) {
            super('balls/ballofyarn', 8, config);
            this.angle = -90;

            this.tail = this.addChild(new Sprite({
                texture: 'ballofyarntail',
                tint: Ball.getTeamColor(config.team),
                copyFromParent: ['layer'],
            }));

            this.yarnTime = 0;
            this.yarnDistance = 0;

            this.addAbility('onCollideWithEnemyPostDamage', BallOfYarn.onCollideWithEnemyPostDamage);
            this.addAbility('update', BallOfYarn.update, { canActivateTwice: false });
        }

        onAdd(): void {
            super.onAdd();
            this.yarnSystem = this.world.addWorldObject(new YarnSystem(this, this.getPosition(), this.slowFactor));

            if (this.world.getLayerByName(Battle.Layers.onground)) {
                this.yarnSystem.layer = Battle.Layers.onground;
            }
        }

        onStateChangeBattle() {
            this.yarnSystem?.setStartPointForBattle(this.getPosition());
        }

        postUpdate() {
            super.postUpdate();
            this.tail.alpha = this.alpha;
            this.tail.scale = this.ballScale * this.moveScale;
            this.tail.angle = this.angle + 90;
            this.tail.effects.outline.color = this.effects.outline.color;
            this.tail.effects.outline.enabled = this.effects.outline.enabled;
            World.Actions.orderWorldObjectBefore(this.tail, this);
        }

        addYarnSegment() {
            if (!this.yarnSystem) return;

            this.yarnSystem.addSegment(this.getPosition(), this.yarnLife);
        }

        private static onCollideWithEnemyPostDamage(source: BallOfYarn, world: World, enemy: Ball, damage: number) {
            enemy.addSlow('yarn', source.slowFactor, source.collisionSlowTime);
        }

        private static update(source: BallOfYarn, world: World): void {
            if (source.state !== Ball.States.BATTLE) return;
            
            source.yarnTime += source.delta;
            source.yarnDistance += source.v.magnitude * source.delta;

            if (source.yarnTime >= 0.3 || source.yarnDistance >= source.physicalRadius) {
                source.yarnTime = 0;
                source.yarnDistance = 0;
                source.addYarnSegment();
            }
        }
    }
}