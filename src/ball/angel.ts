/// <reference path="./ball.ts" />

namespace Balls {
    export class Angel extends Ball {
        getName() { return 'Angel'; }
        getDesc() { return `On death, heal all allies by [g]${this.healAmount}<heart>[/g]`; }
        getShopDmg() { return 3; }
        getShopHp() { return 1; }
        getCredits() { return [CreditsNames.FIREBALLME]; }

        get healAmount() { return this.level; }

        private halo: Sprite;

        constructor(config: Ball.Config) {
            super('balls/angel', 8, config);

            this.halo = this.addChild(new Sprite({
                texture: 'angelhalo',
                copyFromParent: ['layer'],
            }));

            this.addAbility('onDeath', onDeath);
        }

        postUpdate() {
            super.postUpdate();
            this.halo.alpha = this.alpha;
            this.halo.scale = this.ballScale * this.moveScale;
            this.halo.effects.outline.color = this.effects.outline.color;
            this.halo.effects.outline.enabled = this.effects.outline.enabled;
            World.Actions.orderWorldObjectAfter(this.halo, this);
        }
    }

    function onDeath(source: Angel, world: World) {
        let allies = getAlliesNotSelf(world, source);
        if (allies.length === 0) return;

        for (let ally of allies) {
            world.addWorldObject(new HomingHeal(source.x, source.y, source, ally, source.healAmount, balls => undefined));
        }
    }
}