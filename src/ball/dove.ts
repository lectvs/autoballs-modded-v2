namespace Balls {
    export class Dove extends Ball {
        getName() { return 'Dove'; }
        getDesc() { return `On your next loss, you do not lose [r]<heart>[/r]\n\nPermanently removed from your squad on use`; }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.FIREBALLME]; }

        private seenOtherAllyDovesThisRound = false;

        constructor(config: Ball.Config) {
            super('balls/dove', 8, config);

            this.addAbility('onStartShop', Dove.onStartShop, { nullifyable: false, canActivateTwice: false });
        }

        private static onStartShop(source: Dove, world: World) {
            let otherUnseenDovesInSquad = getAlliesNotSelf(world, source).filter(ball => ball instanceof Dove && !ball.isInShop && !ball.seenOtherAllyDovesThisRound);
            if (otherUnseenDovesInSquad.length > 0) {
                source.seenOtherAllyDovesThisRound = true;
            }

            if (getLastRoundResult() === 'loss' && !source.seenOtherAllyDovesThisRound) {
                addBallTypeForAlmanacWin(127);
                ShopActions.removeBallFromSquad(source);
                source.kill();
            }
        }
    }
}