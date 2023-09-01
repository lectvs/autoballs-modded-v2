namespace Balls {
    export class Watcher extends Ball {
        getName() { return 'Watcher'; }
        getDesc() { return `When an ally or enemy is summoned, gain ${buffText(this.buffDamage, this.buffHealth)}`; }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.LIFEWRATH]; }

        get buffDamage() { return 0.5 + 0.5*this.level; }
        get buffHealth() { return 0.5 + 0.5*this.level; }

        constructor(config: Ball.Config) {
            super('balls/watcher', 8, config);

            this.addAbility('onBallJoin', Watcher.onBallJoin);
        }

        private static onBallJoin(source: Watcher, world: World, ball: Ball) {
            if (!ball.isSummon) return;
            Watcher.giveBuff(source);
        }

        private static giveBuff(source: Watcher) {
            source.buff(source.buffDamage, source.buffHealth);
        }

    }
}