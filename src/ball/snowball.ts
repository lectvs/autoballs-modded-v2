namespace Balls {
    export class Snowball extends Ball {
        getName() { return 'Snowball'; }
        getDesc() { return `Grows in size as it rolls, slowly gaining mass and [g]${this.maxHealthGain}<heart>[/g] extra health over ${this.totalTimeToGain} seconds`; }
        getShopDmg() { return 1; }
        getShopHp() { return 2; }

        private readonly INITIAL_SCALE = 0.6;
        private readonly MAX_SCALE = 2;

        private totalHealthGained: number;

        get maxHealthGain() { return 1 + this.level; }
        get totalTimeToGain() { return 10; }

        constructor(config: Ball.Config) {
            super('balls/snowball', 8, config);

            this.setBallScale(this.INITIAL_SCALE);
            this.totalHealthGained = 0;

            this.addAbility('update', Snowball.update);
        }

        private static update(source: Snowball, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let growthRate = (source.MAX_SCALE - source.INITIAL_SCALE) / source.totalTimeToGain;

            let newBallScale = Math.min(source.ballScale + growthRate*source.delta, source.MAX_SCALE);
            source.setBallScale(newBallScale);

            if (source.totalHealthGained < source.maxHealthGain) {
                let healRate = source.maxHealthGain / source.totalTimeToGain;
                let healthAmount = Math.min(healRate * source.delta, source.maxHealthGain - source.totalHealthGained);
                source.hp += healthAmount;
                source.maxhp += healthAmount;
                source.totalHealthGained += healthAmount;
                source.showHpStat(healthAmount, 0.5);
            }
        }
    }
}