namespace Balls {
    export class Cannonball extends Ball {
        getName() { return 'Cannonball'; }
        getDesc() { return 'Heavy'; }
        getShopDmg() { return 1; }
        getShopHp() { return 1; }

        constructor(config: Ball.Config) {
            super('balls/cannonball', 8, config);
            this.setMassScale(4);
        }
    }
}