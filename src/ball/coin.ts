namespace Balls {
    export class Coin extends Ball {
        getName() { return 'Coin'; }
        getDesc() { return `+[gold]<coin>${Coin.getGoldGainPerRound(this)}[/gold] per round while in your squad`; }
        getShopDmg() { return 1; }
        getShopHp() { return 3; }

        static getGoldGainPerRound(source: Ball) { return source.level; }

        storesMoney = true;

        constructor(config: Ball.Config) {
            super('balls/coin', 8, config);

            this.addAbility('onStartShop', Coin.onStartShop);
        }

        static onStartShop(source: Ball, world: World) {
            source.properties.metadata.extraSellValue += Coin.getGoldGainPerRound(source);
            world.addWorldObject(new GainedGold(source.x, source.y - 8, Coin.getGoldGainPerRound(source), 'up'));
            world.playSound('buyball');
        }
    }
}