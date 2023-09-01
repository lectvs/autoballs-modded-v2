namespace Balls {
    export class Pickleball extends Ball {
        getName() { return 'Pickleball'; }
        getDesc() { return `On buy, replace the shop's inventory with pickles`; }
        getShopDmg() { return 2; }
        getShopHp() { return 1; }

        constructor(config: Ball.Config) {
            super('balls/pickleball', 8, config);

            this.addAbility('onBuy', Pickleball.onBuy, { canActivateTwice: false });
        }

        private static onBuy(source: Pickleball, world: World) {
            Shop.restockPickles(world);
            if (source.shouldActivateAbilityTwice()) {
                source.doAfterTime(0.5, () => Shop.restockPickles(world));
            }
        }
    }
}