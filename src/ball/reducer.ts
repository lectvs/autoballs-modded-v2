namespace Balls {
    export class Reducer extends Ball {
        getName() { return 'Reducer'; }
        getDesc() {
            if (this.starsToRemove === 1) return `On enter battle, remove [lb]1[/lb] star from a random enemy`;
            return `On enter battle, remove [lb]${this.starsToRemove}[/lb] stars from random enemies`;
        }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.ACIDGUY, CreditsNames.JUNJ]; }

        get starsToRemove() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/reducer', 8, config);

            this.addAbility('onPreBattle', Reducer.onPreBattle);
            this.addAbility('onEnterBattle', Reducer.onEnterBattle);
        }

        private static onPreBattle(source: Reducer, world: World) {
            Reducer.removeStarsFromEnemies(source, world);
        }

        private static onEnterBattle(source: Reducer, world: World) {
            if (source.hasActivatedAbility('onPreBattle')) return;
            Reducer.removeStarsFromEnemies(source, world);
        }

        private static removeStarsFromEnemies(source: Reducer, world: World) {
            let validBalls = getEnemies(world, source).filter(ball => ball.level > 1);
            if (validBalls.length === 0) return;

            let deleveledBalls: Ball[] = [];
            let deboosts: RandomDeboost[] = [];
            for (let i = 0; i < source.starsToRemove; i++) {
                let ball = Ball.Random.element(validBalls);
                if (!ball) break;
                
                let deboost = world.addWorldObject(new RandomDeboost(source.x, source.y, source, ball, Ball.Random.float(0.2, 0.6), enemies => Ball.Random.element(enemies)));

                deboosts.push(deboost);
                deleveledBalls.push(ball);

                if (deleveledBalls.filter(b => b === ball).length === ball.level-1) {
                    A.removeAll(validBalls, ball);
                }
            }

            source.setPreBattleAbilityActiveCheck(() => deboosts.some(deboost => deboost.world));
        }
    }
}