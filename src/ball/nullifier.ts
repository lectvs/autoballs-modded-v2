namespace Balls {
    export class Nullifier extends Ball {
        getName() { return 'Nullifier'; }
        getDesc() {
            if (this.nullifyTime === 0) return `Completely disable the effects and equipment of a random enemy with a battle effect until the battle starts`;
            let max = this.nullifyTime === this.maxNullifyTime ? ' (max)' : '';
            return `Completely disable the effects and equipment of a random enemy with a battle effect until the battle starts and [lb]${this.nullifyTime}s[/lb] after${max}`;
        }
        getShopDmg() { return 2; }
        getShopHp() { return 6; }
        getCredits() { return [CreditsNames.TOMMYDOG145]; }

        get nullifyTime() {
            if (this.level === 1) return 0;
            if (this.level === 2) return 2;
            if (this.level === 3) return 4;
            if (this.level === 4) return 5;
            if (this.level === 5) return 5.5;
            if (this.level === 6) return 6;
            if (this.level === 7) return 6.5;
            return this.maxNullifyTime;
        }
        get maxNullifyTime() { return 7; }

        private target: Ball;

        constructor(config: Ball.Config) {
            super('balls/nullifier', 8, config);

            this.preBattleAbilityInitialWaitTime = 0.5;

            this.addAbility('onPreBattle', Nullifier.onPreBattle);
            this.addAbility('onEnterBattle', Nullifier.onEnterBattle);
            this.addAbility('onDeath', Nullifier.onDeath, { nullifyable: false });
            this.addAbility('update', Nullifier.update);
        }

        private static onPreBattle(source: Nullifier, world: World) {
            Nullifier.selectTarget(source, world);
            Nullifier.nullifyTarget(source, world);
        }

        private static onEnterBattle(source: Nullifier, world: World) {
            if (source.hasActivatedAbility('onPreBattle')) return;
            Nullifier.selectTarget(source, world);
            Nullifier.nullifyTarget(source, world);
        }

        private static onDeath(source: Nullifier, world: World, killedBy: Ball) {
            if (!source.target) return;
            source.target.removeNullified();
        }

        private static selectTarget(source: Nullifier, world: World) {
            let enemies = getEnemies(world, source).filter(ball => !(ball instanceof Nullifier) && !ball.statusEffects.find(effect => effect.type === 'nullified'));
            let battleEnemies = enemies.filter(ball => ball.hasBattleEffect());
            if (battleEnemies.length > 0) enemies = battleEnemies;
            if (enemies.length === 0) return;

            source.target = Ball.Random.element(enemies);
        }

        private static update(source: Nullifier, world: World) {
            if (source.state === Ball.States.PREP) return;
            if (getBattleState(world) === Ball.States.BATTLE) return;
            Nullifier.nullifyTarget(source, world);
        }

        private static nullifyTarget(source: Nullifier, world: World) {
            if (!source.target) return;
            source.target.addNullified(Math.max(source.nullifyTime, 0.2));
            source.target.cancelAbilities();
        }
    }
}