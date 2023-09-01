namespace Balls {
    export class Guardian extends Ball {
        getName() { return 'Guardian'; }
        getDesc() { return `When an ally takes discrete damage, heal it for [g]${this.healAmount}<heart>[/g]`; }
        getShopDmg() { return 3; }
        getShopHp() { return 6; }
        getCredits() { return [CreditsNames.TOMMYDOG145]; }

        get healAmount() { return this.level; }

        private cooldown: AbilityCooldown;

        constructor(config: Ball.Config) {
            super('balls/guardian', 8, config);

            this.cooldown = new AbilityCooldown(0.5, 2);

            this.addAbility('onBallTakeDamage', Guardian.onBallTakeDamage);
        }

        update() {
            super.update();
            this.cooldown.update(this.delta);
        }

        private static onBallTakeDamage(source: Guardian, world: World, ball: Ball, damage: number) {
            if (ball.team !== source.team) return;
            if (!source.cooldown.consumeUse()) return;

            world.addWorldObject(new HomingHeal(source.x, source.y, source, ball, source.healAmount, balls => undefined));
        }
    }
}