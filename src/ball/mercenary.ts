namespace Balls {
    export class Mercenary extends Ball {
        getName() { return 'Mercenary'; }
        getDesc() { return `Gain [r]${this.dmgGain}<sword>[/r] when entering the battle\n\nYou must [r]pay[/r] [gold]<coin>${this.payPerKill}[/gold] for each kill it gets`; }
        getShopDmg() { return 2; }
        getShopHp() { return 4; }
        getCredits() { return [CreditsNames.JUNJ]; }

        get dmgGain() { return 1 + 2*this.level; }
        get payPerKill() { return 1; }

        constructor(config: Ball.Config) {
            super('balls/mercenary', 8, config);

            this.preBattleAbilityInitialWaitTime = 0.5;

            this.addAbility('onPreBattle', Mercenary.onPreBattle);
            this.addAbility('onEnterBattle', Mercenary.onEnterBattle);
            this.addAbility('onKill', Mercenary.onKill);
        }

        private static onPreBattle(source: Mercenary, world: World) {
            Mercenary.getBuff(source);
        }

        private static onEnterBattle(source: Mercenary, world: World) {
            if (source.hasActivatedAbility('onPreBattle')) return;
            Mercenary.getBuff(source);
        }

        private static getBuff(source: Mercenary) {
            source.buff(source.dmgGain, 0);
        }

        private static onKill(source: Mercenary, world: World, killed: Ball) {
            if (source.team !== 'friend' || !youArePlaying(world)) return;
            
            addStartShopEffect({
                type: 'gold',
                sourceSquadIndex: source.squadIndexReference,
                gold: -source.payPerKill,
            });
        }
    }
}