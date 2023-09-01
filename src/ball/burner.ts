namespace Balls {
    export class Burner extends Ball {
        getName() { return 'Burner'; }
        getDesc() {
            if (this.burnTime <= 0) return `Burn nearby enemies\n\nBurning balls take [r]1<sword>/s[/r]`;
            return `Burn nearby enemies for [lb]${this.burnTime}s[/]\n\nBurning balls take [r]1<sword>/s[/r]`;
        }
        getShopDmg() { return 1; }
        getShopHp() { return 6; }
        getCredits() { return [CreditsNames.C_RRY, CreditsNames.MATERWELONS]; }

        get burnRadius() { return this.physicalRadius-8 + 96*Math.exp(0.33*this.level)/(Math.exp(0.33*this.level) + 2); }
        get burnTime() { return this.level-1; }

        constructor(config: Ball.Config) {
            super('balls/burner', 8, config);

            this.addAbility('update', Burner.update);
        }

        onAdd() {
            super.onAdd();
            this.addChild(new AbilityRadius(this, () => this.burnRadius, 0xFF2200, 0xFF8800, 0.6));
        }

        private static update(source: Burner, world: World) {
            if (source.state !== Ball.States.BATTLE) return;

            let enemyBalls = getEnemies(world, source);

            for (let ball of enemyBalls) {
                if (G.distance(ball, source) < ball.radius + source.burnRadius) {
                    ball.addBurning(source, Math.max(source.burnTime, 0.1));
                }
            }
        }
    }
}