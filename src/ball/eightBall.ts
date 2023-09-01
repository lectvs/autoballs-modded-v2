/// <reference path="ball.ts" />

namespace Balls {
    export class EightBall extends Ball {
        getName() { return '8 Ball'; }
        getDesc() { return `Gain [gold]<coin>${this.goldGain}[/gold] if it survives a battle`; }
        getShopDmg() { return 1; }
        getShopHp() { return 3; }

        get goldGain() { return 2 + this.level; }

        constructor(config: Ball.Config) {
            super('balls/8ball', 8, config);

            this.addAbility('onSurviveBattle', (source, world) => {
                addStartShopEffect({
                    type: 'gold',
                    sourceSquadIndex: source.squadIndexReference,
                    gold: source.goldGain,
                });
            });
        }
    }
}