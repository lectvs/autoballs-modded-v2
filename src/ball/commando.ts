namespace Balls {
    export class Commando extends Ball {
        getName() { return 'Commando'; }
        getDesc() { return `Gain +${buffText(this.buffDamage, this.buffHealth)} when an ally dies`; }
        getShopDmg() { return 5; }
        getShopHp() { return 5; }

        get buffDamage() { return 0.5 * this.level; }
        get buffHealth() { return 0.5 * this.level; }

        constructor(config: Ball.Config) {
            super('balls/commando', 8, config);

            this.addAbility('onBallDie', Commando.onBallDie);
        }

        private static onBallDie(source: Commando, world: World, ball: Ball): void {
            if (ball.team !== source.team) return;
            source.buff(source.buffDamage, source.buffHealth);
        }
    }
}