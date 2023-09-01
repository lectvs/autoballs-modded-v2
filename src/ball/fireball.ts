namespace Balls {
    export class Fireball extends Ball {
        getName() { return 'Fireball'; }
        getDesc() { return `On collision, light enemies on fire for [lb]${this.burnTime}s[/lb]\n\nBurning balls take [r]1<sword>/s[/r]`; }
        getShopDmg() { return 0; }
        getShopHp() { return 3; }
        getShopRelativePosition() { return vec2(0, 3); }
        getCredits() { return [CreditsNames.RATIS, CreditsNames.WALUX]; }

        get burnTime() { return 1 + this.properties.level; }

        private fire: Sprite;
        private fireFilter: FireFilter;

        constructor(config: Ball.Config) {
            super('balls/fireball', 8, config);

            let outlineI = _.findLastIndex(this.effects.pre.filters, f => f instanceof Effects.Filters.Outline);
            if (outlineI >= 0) {
                this.effects.pre.filters[outlineI] = new Effects.Filters.Outline(Ball.getDarkTeamColor(this.team), 1);
            }

            this.fireFilter = new FireFilter();
            this.fire = this.addChild(new Sprite({
                texture: new AnchoredTexture(Texture.filledRect(66, 66, 0xFF8F00), 0.5, 0.5),
                effects: { pre: { filters: [this.fireFilter] } },
                copyFromParent: ['layer'],
            }));

            this.addAbility('onCollideWithEnemyPostDamage', Fireball.onCollideWithEnemyPostDamage);
        }

        updateBattle() {
            super.updateBattle();

            let targetAngle = 180-this.angle;
            let targetLength = M.mapClamp(this.getSpeed(), 0, Ball.maxSpeedBase, 0, 2);

            let angleDiff = M.angleDiff(this.fireFilter.angle, targetAngle);
            targetLength = M.mapClamp(angleDiff, 0, 90, targetLength, 0);

            this.fireFilter.angle = M.moveToAngleClamp(this.fireFilter.angle, targetAngle, 480, this.delta);
            this.fireFilter.length = M.moveToClamp(this.fireFilter.length, targetLength, 8, this.delta);
        }

        postUpdate() {
            super.postUpdate();

            this.fire.alpha = this.alpha;
            this.fire.scale = this.ballScale * this.moveScale;
            World.Actions.orderWorldObjectBefore(this.fire, this);
        }

        onCollide(collision: Physics.Collision) {
            super.onCollide(collision);

            if (this.state === Ball.States.BATTLE) {
                this.fireFilter.length = 0;
            }
        }

        private static onCollideWithEnemyPostDamage(source: Fireball, world: World, collideWith: Ball, damage: number) {
            collideWith.addBurning(source, source.burnTime);
        }
    }
}