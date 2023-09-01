namespace Balls {
    export class Bank extends Ball {
        getName() { return 'Bank'; }
        getDesc() {
            if (Bank.getRounds(this) === 1) return `Keeps [gold]<coin>1 unspent[/gold] each round. For every [gold]<coin>[/gold] kept, gain [gold]<coin>1[/gold] every round for the next [lb]round[/lb]`;
            let parenthetical = Bank.getRounds(this) >= Bank.MAX_ROUNDS ? '[gold](max)[/gold]' : '(even if Bank is sold)'
            return `Keeps [gold]<coin>1 unspent[/gold] each round. For every [gold]<coin>[/gold] kept, gain [gold]<coin>1[/gold] every round (stacking) for the next [lb]${Bank.getRounds(this)} rounds[/lb] ${parenthetical}`;
        }
        getShopDmg() { return 1; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.EVERYONE]; }

        static MAX_ROUNDS = 6;
        static getRounds(source: Ball) { return Math.min(1+source.level, Bank.MAX_ROUNDS); }

        constructor(config: Ball.Config) {
            super('balls/bank', 8, config);

            this.addAbility('onPlay', Bank.onPlay);
        }

        static onPlay(source: Ball, world: World) {
            if (GAME_DATA.gold <= 0) return;
            
            let gold = 1;
            GAME_DATA.gold -= gold;

            let prepCoin = world.select.name('goldcoin');
            let position = prepCoin ? prepCoin.getPosition().add(4, 0) : source.getPosition();

            let homingGold = world.addWorldObject(new HomingGoldVisual(position.x, position.y, source, gold));

            source.runScript(function*() {
                yield S.waitUntil(() => !homingGold.world);
                GAME_DATA.bankedGold.push({ squadIndex: source.squadIndexReference, goldPerRound: 1, roundsLeft: Bank.getRounds(source) });
            });

            FIND_OPPONENT_WAIT_TIME = Math.max(FIND_OPPONENT_WAIT_TIME, 2);
        }
    }
}