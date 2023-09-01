namespace Balls {
    export class Phoenix extends Ball {
        getName() { return 'Phoenix'; }
        getDesc() { return `Burst into flames after ${this.explodeTime}s, igniting enemies for [lb]${this.burnTime}s[/lb], and [y]resurrect shortly after[/y]\n\nBurning balls take [r]1<sword>/s[/r]`; }
        getShopDmg() { return 3; }
        getShopHp() { return 6; }
        getCredits() { return [CreditsNames.FIREBALLME]; }

        get explodeTime() { return 3; }
        get burnTime() { return 1 + this.level; }

        get explosionRadius() { return this.physicalRadius-8 + 40 * (1 + (this.level-1)*0.25); }
        get yourSquadRadius() { return 15; }

        private visibleExplosionRadius: number;
        private fuseTime: number;
        private fuseFilter: Effects.Filters.Silhouette;
        isResurrection = false;
        canExplode = true;

        constructor(config: Ball.Config) {
            super('balls/phoenix', 8, config);
            this.visibleExplosionRadius = this.explosionRadius;

            this.fuseTime = 0;
            this.fuseFilter = new Effects.Filters.Silhouette(0xFF8F00, 1);
            this.fuseFilter.amount = 0;

            let i = this.effects.pre.filters.findIndex(f => f instanceof BallTeamColorFilter);
            this.effects.pre.filters.splice(i+1, 0, this.fuseFilter);

            this.addAbility('update', Phoenix.update, { canActivateTwice: false });
            this.addAbility('onDeath', Phoenix.onDeath, { canActivateTwice: false });
        }

        render(texture: Texture, x: number, y: number) {
            let drawRadius = this.isInYourSquadScene ? this.yourSquadRadius : this.visibleExplosionRadius;
            Draw.brush.color = Color.lerpColorByLch(0xFF8F00, 0xFFBF00, Tween.Easing.OscillateSine(2)(this.life.time));
            Draw.brush.alpha = 0.6;
            Draw.brush.thickness = 1;
            Draw.circleOutline(texture, x, y, drawRadius, Draw.ALIGNMENT_INNER);

            super.render(texture, x, y);
        }

        postUpdate() {
            super.postUpdate();

            if (this.isInShop && !this.isBeingMoved()) {
                this.visibleExplosionRadius = 0;
            } else if (!this.canExplode) {
                this.visibleExplosionRadius = 0;
            } else {
                 this.visibleExplosionRadius = M.lerpTime(this.visibleExplosionRadius, this.explosionRadius, 100, this.delta);
            }
        }

        setForInShop(): void {
            this.visibleExplosionRadius = 0;
        }

        private static update(source: Phoenix, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            if (!source.canExplode) return;
            
            source.fuseTime += source.delta;

            source.fuseFilter.amount = M.mapClamp(source.timeInBattle, 0, source.explodeTime, 0, 1);

            if (source.fuseTime >= source.explodeTime) {
                let hp = source.hp;
                let dmg = source.dmg;
                source.takeDamage(2 * source.hp, source, 'other', true);
                Phoenix.explode(source, world, hp, dmg);
            }
        }

        private static onDeath(source: Phoenix, world: World, killedBy: Ball) {
            if (!source.canExplode) return;
            Phoenix.explode(source, world, 0, 1);
        }

        private static explode(source: Phoenix, world: World, hp: number, dmg: number) {
            world.addWorldObject(new PhoenixAshes(source.x, source.y, source, hp, dmg));
            world.addWorldObject(new FireExplosion(source.x, source.y, source.explosionRadius, source.burnTime, source));
            source.canExplode = false;
        }
    }
}