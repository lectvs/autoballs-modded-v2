namespace Balls {
    export class Crusher extends Ball {
        getName() { return 'Crusher'; }
        getDesc() { return `On collide with enemy, gain [r]${this.dmgGain}<sword>[/r]`; }
        getShopDmg() { return 1; }
        getShopHp() { return 6; }

        get dmgGain() { return this.level; }

        private cooldown: Timer;

        constructor(config: Ball.Config) {
            super('balls/crusher', 8, config);

            this.cooldown = this.addTimer(0.1);
            this.cooldown.finish();

            this.addAbility('onCollideWithEnemyPostDamage', Crusher.onCollideWithEnemyPostDamage, { canActivateTwice: false });
        }

        private static onCollideWithEnemyPostDamage(source: Crusher, world: World, collideWith: Ball, damage: number) {
            if (!source.cooldown.done) return;
            Crusher.buff(source);
            if (source.shouldActivateAbilityTwice()) {
                Crusher.buff(source);
            }
            source.cooldown.reset();
        }

        private static buff(source: Crusher) {
            source.buff(source.dmgGain, 0);
        }
    }
}