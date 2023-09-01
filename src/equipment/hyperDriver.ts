/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class HyperDriver extends OrbitEquipment {
        getName() { return 'Hyper Driver'; }
        getDesc() {
            let PLAY = `${GAME_MODE === 'vs' || GAME_MODE === 'spectate' ? 'LOCK IN' : 'PLAY'}`;
            return `On ${PLAY}, takes [gold]<coin>${this.goldRequirement} unspent[/gold] to permanently gain ${buffText(2, 2)}`;
        }

        get goldRequirement() { return 5; }

        constructor() {
            super('equipments/hyperdriver', 'items/hyperdriver');

            this.addAbility('onPlay', HyperDriver.onPlay);
        }

        private static onPlay(equipment: HyperDriver, source: Ball, world: World) {
            if (GAME_DATA.gold < equipment.goldRequirement) return;
            

            GAME_DATA.gold -= equipment.goldRequirement;
            animateGiveOrTakeShopGold(world, source, -equipment.goldRequirement);

            source.buff(2, 2);

            FIND_OPPONENT_WAIT_TIME = Math.max(FIND_OPPONENT_WAIT_TIME, 2);
        }
    }
}
