/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Curry extends OrbitEquipment {
        getName() { return 'Curry'; }
        getDesc() { return `On fire and moves at 200% speed for 10 seconds`; }

        constructor() {
            super('equipments/curry', 'items/curry');

            this.addAbility('onEnterBattle', Curry.onEnterBattle, { nullifyable: false });
        }

        private static onEnterBattle(equipment: Curry, source: Ball, world: World) {
            equipment.runScript(function*() {
                yield S.doOverTime(10, t => {
                    if (!source.isNullified()) {
                        source.addBurning(source, 0.1);
                        source.addBoostMaxSpeed(equipment, 'other', 2, 2, 1);
                        source.addScaleAcceleration(equipment, 2, 0.1);
                    }
                });

                if (source.equipment === equipment) {
                    source.breakEquipment();
                }
            });
        }
    }
}
