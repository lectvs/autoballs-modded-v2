namespace Balls {
    export class Watermelon extends Ball {
        getName() { return this.displayedName; }
        getDesc() { return `Collisions cause [r]${this.splashDamage}<sword>[/r] splash damage to nearby enemies`; }
        getShopDmg() { return 0; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.POPAN]; }

        get splashDamage() { return 0.5 + 0.5*this.level; }
        get splashRadius() { return 24; }

        private displayedName: string;
        private direction: Vector2;
        private cooldown: Timer;

        constructor(config: Ball.Config) {
            super('balls/watermelon', 8, config);
            this.angle = 90;

            this.displayedName = Random.boolean(0.9) ? 'Watermelon' : 'Materwelon';
            this.direction = vec2(0, 0);

            this.cooldown = this.addTimer(0.1);
            this.cooldown.finish();

            this.addAbility('onCollideWithEnemyPostDamage', Watermelon.onCollideWithEnemyPostDamage, { canActivateTwice: false });
        }

        updateBattle() {
            super.updateBattle();

            this.direction.set(this.v);
        }

        private static onCollideWithEnemyPostDamage(source: Watermelon, world: World, collideWith: Ball, damage: number) {
            if (!source.cooldown.done) return;
            Watermelon.splash(source, world);
            if (source.shouldActivateAbilityTwice()) {
                source.doAfterTime(0.1, () => Watermelon.splash(source, world));
            }
            source.cooldown.reset();
        }

        private static splash(source: Watermelon, world: World) {
            let p = source.direction.withMagnitude(16).add(source.x, source.y);
            let splash = world.addWorldObject(new CircleImpact(p.x, p.y, source.splashRadius, { ally: 0, enemy: source.splashDamage }, source));
            splash.color = 0xFF0044;
            world.playSound('splash');
        }
    }
}