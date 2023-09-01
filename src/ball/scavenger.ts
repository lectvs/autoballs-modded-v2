namespace Balls {
    export class Scavenger extends Ball {
        getName() { return 'Scavenger'; }
        getDesc() {
            let s = this.freeRestocksPerKill === 1 ? '' : 's';
            return `Gain [lb]${this.freeRestocksPerKill}[/lb] free restock${s} next\nround for each kill (max ${this.limit})`;
        }
        getShopDmg() { return 3; }
        getShopHp() { return 1; }
        getCredits() { return [CreditsNames.MATERWELONS]; }

        get freeRestocksPerKill() { return this.level; }
        get limit() { return 5; }

        private restocksGained: number;

        constructor(config: Ball.Config) {
            super('balls/scavenger', 8, config);
            this.restocksGained = 0;

            this.addAbility('onKill', Scavenger.onKill);
        }

        private static onKill(source: Scavenger, world: World, killed: Ball) {
            if (source.team !== 'friend' || !youArePlaying(world)) return;
            if (source.restocksGained >= source.limit) return;

            let restocksToGain = M.clamp(source.freeRestocksPerKill, 0, source.limit - source.restocksGained);
            addStartShopEffect({
                type: 'restocks',
                sourceSquadIndex: source.squadIndexReference,
                restocks: restocksToGain,
            });
            source.restocksGained += restocksToGain;
        }
    }
}
