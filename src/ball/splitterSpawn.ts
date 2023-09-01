namespace Balls {
    export class SplitterSpawn extends Ball {
        getName() { return 'Splitter Spawn'; }
        getDesc() { return 'No effect'; }
        getShopDmg() { return 1; }
        getShopHp() { return 2; }

        constructor(config: Ball.Config) {
            super('balls/splitspawn', 4, config);
        }
    }
}