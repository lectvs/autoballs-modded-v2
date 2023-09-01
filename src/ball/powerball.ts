namespace Balls {
    export class Powerball extends Ball {
        getName() { return 'Powerball'; }
        getDesc() { return `Start the shop with [gold]<coin>${Powerball.getGoldGain(this)} extra[/gold] ([gold]<coin>3[/gold] max)`; }
        getShopDmg() { return 1; }
        getShopHp() { return 3; }

        static getGoldGain(source: Ball) { return Math.min(source.level, 3); }

        constructor(config: Ball.Config) {
            super('balls/powerball', 8, config);

            this.addAbility('onStartShop', Powerball.onStartShop);
        }

        static onStartShop(source: Ball, world: World) {
            addStartShopEffect({
                type: 'gold',
                sourceSquadIndex: source.squadIndexReference,
                gold: Powerball.getGoldGain(source),
            });
        }
    }
}