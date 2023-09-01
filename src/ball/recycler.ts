namespace Balls {
    export class Recycler extends Ball {
        getName() { return 'Recycler'; }
        getDesc() { return `On sell, gain [lb]${Recycler.getFreeRestocks(this)}[/lb] free restocks for this round`; }
        getShopDmg() { return 2; }
        getShopHp() { return 2; }

        static getFreeRestocks(source: Ball) { return 1 + source.level; }

        constructor(config: Ball.Config) {
            super('balls/recycler', 8, config);

            this.addAbility('onSell', Recycler.onSell);
        }

        static onSell(source: Ball, world: World) {
            GAME_DATA.freeRestocksUntilPlay += Recycler.getFreeRestocks(source);
        }
    }
}