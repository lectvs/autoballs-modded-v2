namespace Balls {
    export class Booster extends Ball {
        getName() { return 'Booster'; }
        getDesc() {
            if (this.starsToGive === 1) return `On enter battle, level-up a random ally`;
            return `On enter battle, level-up [lb]${this.starsToGive}[/lb] random allies`;
        }
        getShopDmg() { return 3; }
        getShopHp() { return 4; }

        get starsToGive() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/booster', 8, config);

            this.addAbility('onPreBattle', Booster.onPreBattle);
            this.addAbility('onEnterBattle', Booster.onEnterBattle);
        }

        private static onPreBattle(source: Booster, world: World) {
            Booster.boostAlly(source, world);
        }

        private static onEnterBattle(source: Booster, world: World) {
            if (source.hasActivatedAbility('onPreBattle')) return;
            Booster.boostAlly(source, world);
        }

        private static boostAlly(source: Booster, world: World) {
            let validBalls = getAlliesNotSelf(world, source);
            if (validBalls.length === 0) return;

            if (validBalls.length > source.starsToGive) {
                Ball.Random.shuffle(validBalls);
                validBalls = validBalls.slice(0, source.starsToGive);
            }

            let boosts: HomingBoost[] = [];
            for (let ball of validBalls) {
                let boost = world.addWorldObject(new HomingBoost(source.x, source.y, source, ball, 1, Ball.Random.float(0.2, 0.6), allies => Ball.Random.element(allies)));
                boosts.push(boost);
            }

            source.setPreBattleAbilityActiveCheck(() => boosts.some(boost => boost.world));
        }
    }
}