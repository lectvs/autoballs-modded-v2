namespace Balls {
    export class Gladiator extends Ball {
        getName() { return 'Gladiator'; }
        getDesc() {
            if (this.totalShields === 1) return `Gains a Shield after its [lb]first[/lb] kill`;
            return `Gains a Shield after each of its first [lb]${this.totalShields}[/lb] kills`;
        }
        getShopDmg() { return 5; }
        getShopHp() { return 4; }
        getCredits() { return [CreditsNames.BALLAM]; }

        get totalShields() { return this.level; }
        private shieldsGained: number = 0;

        constructor(config: Ball.Config) {
            super('balls/gladiator', 8, config);

            this.addAbility('onKill', Gladiator.onKill, { canActivateTwice: false });
        }

        private static onKill(source: Gladiator, world: World, killed: Ball): void {
            source.runScript(S.chain(
                S.yield(),
                S.call(() => {
                    if (source.shieldsGained < source.totalShields) {
                        source.equip(0);
                        source.shieldsGained++;
                        world.playSound('buyball', { limit: 2 });
                    }
                }),
            ));
        }
    }
}