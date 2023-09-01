/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Claws extends OrbitEquipment {
        getName() { return 'Claws'; }
        getDesc() { return `Claws the first enemy collided with for [r]4<sword> extra[/r]`; }

        constructor() {
            super('equipments/claws', 'items/claws');

            this.addAbility('onCollideWithEnemyPostDamage', Claws.onCollideWithEnemyPostDamage);
        }

        private static onCollideWithEnemyPostDamage(equipment: Claws, source: Ball, world: World, ball: Ball, damage: number) {
            world.addWorldObject(new ClawSlash(ball, source, 4, true));
            source.unequip();
        }
    }
}
