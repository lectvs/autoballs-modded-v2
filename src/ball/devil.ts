namespace Balls {
    export class Devil extends Ball {
        getName() { return 'Devil'; }
        getDesc() { return `On death, shoot a [r]${this.spikeDamage}<sword>[/r] homing spike at every enemy`; }
        getShopDmg() { return 5; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.FIREBALLME, CreditsNames.NEPDEP]; }

        get spikeDamage() { return 1 + this.level; }

        private horns: Sprite;

        constructor(config: Ball.Config) {
            super('balls/devil', 8, config);

            this.horns = this.addChild(new Sprite({
                texture: 'devilhorns',
                tint: Ball.getTeamColor(config.team),
                copyFromParent: ['layer'],
            }));

            this.addAbility('onDeath', Devil.onDeath);
        }

        postUpdate() {
            super.postUpdate();
            this.horns.alpha = this.alpha;
            this.horns.scale = this.ballScale * this.moveScale;
            this.horns.angle = this.angle;
            this.horns.effects.outline.color = this.effects.outline.color;
            this.horns.effects.outline.enabled = this.effects.outline.enabled;
            World.Actions.orderWorldObjectAfter(this.horns, this);
        }

        private static onDeath(source: Devil, world: World, killedBy: Ball) {
            let enemies = getEnemies(world, source);
            if (enemies.length === 0) return;

            for (let enemy of enemies) {
                world.addWorldObject(new HomingSpike(source.x, source.y, source, enemy, source.spikeDamage, 1, _ => undefined));
                source.didShootProjectile(1);
            }
        }
    }
}