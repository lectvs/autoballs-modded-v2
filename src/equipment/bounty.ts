/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Bounty extends OrbitEquipment {
        getName() { return 'Bounty'; }
        getDesc() { return `Start the shop with [gold]1<coin>[/gold] extra for each kill (max [gold]3<coin>[/gold])`; }

        private totalGoldGained = 0;

        constructor() {
            super('equipments/bounty', 'items/bounty');

            this.addAbility('onKill', Bounty.onKill);
        }

        private static onKill(equipment: Bounty, source: Ball, world: World, killed: Ball): void {
            if (source.team !== 'friend') return;
            if (!youArePlaying(world)) return;
            if (equipment.totalGoldGained >= 3) return;

            addStartShopEffect({
                type: 'gold',
                sourceSquadIndex: source.squadIndexReference,
                gold: 1,
            });
            
            equipment.totalGoldGained++;
        }
    }
}
