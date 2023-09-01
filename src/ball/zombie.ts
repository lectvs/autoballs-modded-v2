namespace Balls {
    export class Zombie extends Ball {
        getName() { return 'Zombie'; }
        getDesc() { return `On death, summon a ${buffText(this.skeletonPower, this.skeletonPower)} skeleton`; }
        getShopDmg() { return 1; }
        getShopHp() { return 2; }

        get skeletonPower() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/zombie', 8, config);

            this.addAbility('onDeath', Zombie.onDeath);
        }

        private static onDeath(source: Zombie, world: World, killedBy: Ball) {
            world.addWorldObject(squadBallToWorldBall({
                x: source.x,
                y: source.y,
                properties: {
                    type: 16,
                    level: 1,
                    damage: source.skeletonPower,
                    health: source.skeletonPower,
                    equipment: -1,
                    metadata: {},
                }
            }, undefined, -1, source.team));
        }
    }
}