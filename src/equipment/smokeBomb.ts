namespace Equipments {
    export class SmokeBomb extends OrbitEquipment {
        getName() { return 'Smoke Bomb'; }
        getDesc() { return `Disappear on entering battle, avoiding collisions for 2 seconds. Reappear in a burst of [r]2x the ball's <sword>[/r]`; }

        constructor() {
            super('equipments/smokebomb', 'items/smokebomb');

            this.addAbility('onEnterBattle', SmokeBomb.onEnterBattle);
        }

        private static onEnterBattle(equipment: SmokeBomb, source: Ball, world: World) {
            source.becomeEtherealForTime(2);
            source.unequip();
        }
    }
}
