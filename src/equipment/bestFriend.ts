/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class BestFriend extends OrbitEquipment {
        getName() { return 'Best Friend'; }
        getDesc() { return `On death, revive with [r]1<sword>[/r] [g]1<heart>[/g]`; }

        constructor() {
            super('equipments/bestfriend', 'items/bestfriend');
            this.orbitingIcon.radiusScale = 14/12;

            this.addAbility('onDeath', BestFriend.onDeath);
        }

        private static onDeath(equipment: BestFriend, source: Ball, world: World, killedBy: Ball): void {
            source.unequip();

            let ballToRevive = source;
            if (source instanceof Balls.Crown && source.squadIndexReference >= 0 && source.squadIndexReference < GAME_DATA.squad.balls.length) {
                ballToRevive = squadBallToWorldBall(GAME_DATA.squad.balls[source.squadIndexReference], source.squad, source.squadIndexReference, source.team);
            }

            world.addWorldObject(new Dio(source.x, source.y, ballToRevive, 1, 1));
        }
    }
}
