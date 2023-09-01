namespace Balls {
    export class Grenade extends Ball {
        getName() { return 'Grenade'; }
        getDesc() { return `Explode on death, dealing [r]its <sword>[/r] in a radius\n\nHealth resets to zero on level-up`; }
        getShopDmg() { return 2; }
        getShopHp() { return 0; }

        get explosionRadius() { return this.physicalRadius-8 + 100*Math.exp(0.25*this.level)/(Math.exp(0.25*this.level) + 3); }
        get explosionDmgMult() { return 1; }
        get yourSquadRadius() { return 15; }

        private handle: Sprite;
        private visibleExplosionRadius: number;

        constructor(config: Ball.Config) {
            super('balls/grenade', 8, config);
            this.angle = 90;
            this.visibleExplosionRadius = this.explosionRadius;

            this.handle = this.addChild(new Sprite({
                texture: 'grenadehandle',
                copyFromParent: ['layer'],
            }));

            this.addAbility('onDeath', Grenade.onDeath);
        }

        postUpdate() {
            super.postUpdate();
            this.handle.alpha = this.alpha;
            this.handle.scale = this.ballScale * this.moveScale;
            this.handle.angle = this.angle - 90;
            this.handle.effects.outline.color = this.effects.outline.color;
            this.handle.effects.outline.enabled = this.effects.outline.enabled;
            World.Actions.orderWorldObjectBefore(this.handle, this);

            if ((this.isInShop && !this.isBeingMoved()) || this.isNullified()) {
                this.visibleExplosionRadius = 0;
            } else {
                 this.visibleExplosionRadius = M.lerpTime(this.visibleExplosionRadius, this.explosionRadius, 100, this.delta);
            }
        }

        setForInShop(): void {
            this.visibleExplosionRadius = 0;
        }

        render(texture: Texture, x: number, y: number) {
            let drawRadius = this.isInYourSquadScene ? this.yourSquadRadius : this.visibleExplosionRadius;
            Draw.brush.color = Color.lerpColorByLch(0xFF0000, 0xFF3333, Tween.Easing.OscillateSine(2)(this.life.time));
            Draw.brush.alpha = 0.6;
            Draw.brush.thickness = 1;
            Draw.circleOutline(texture, x, y, drawRadius, Draw.ALIGNMENT_INNER);

            super.render(texture, x, y);
        }

        levelUp(withProperties: SquadBallProperties, withFanfare: boolean = true, withStatIncrease: boolean = true) {
            super.levelUp(withProperties, withFanfare, withStatIncrease);
            this.hp = 0;
        }

        private static onDeath(source: Grenade, world: World, killedBy: Ball) {
            let explosionDamage = source.explosionDmgMult * source.dmg;
            world.addWorldObject(new Explosion(source.x, source.y, source.explosionRadius, { ally: 0, enemy: explosionDamage }, source));
        }
    }
}