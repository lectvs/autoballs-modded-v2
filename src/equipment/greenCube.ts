namespace Equipments {
    export class GreenCube extends OrbitEquipment {
        getName() { return 'Green Cube'; }
        getDesc() { return `Abilities have a 33% chance of activating twice`; }

        constructor() {
            super('equipments/greencube', 'items/greencube');
        }
    
        chanceToActivateAbilitiesTwice = 0.33;
    }
}
