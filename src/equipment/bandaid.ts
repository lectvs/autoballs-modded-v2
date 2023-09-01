/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Bandaid extends OrbitEquipment {
        getName() { return 'Bandaid'; }
        getDesc() { return `If this ball dies during battle, it gains [g]1<heart>[/g] next round`; }

        constructor() {
            super('equipments/bandaid', 'items/bandaid');

            this.addAbility('onEquip', Bandaid.onEquip);
            this.addAbility('onDeath', Bandaid.onDeath);
        }

        private static onEquip(equipment: Bandaid, source: Ball, world: World) {
            if (source.state !== Ball.States.PRE_BATTLE && source.state !== Ball.States.BATTLE) return;
            source.buff(0, 1);
        }

        private static onDeath(equipment: Bandaid, source: Ball, world: World, killedBy: Ball): void {
            if (source.team !== 'friend') return;
            if (!youArePlaying(world)) return;
            if (source.squadIndexReference < 0) return;
            if (hasStartShopEffect('buff', source.squadIndexReference)) return;

            addStartShopEffect({
                type: 'buff',
                sourceSquadIndex: source.squadIndexReference,
                health: 1,
                damage: 0,
            });
        }
    }
}
