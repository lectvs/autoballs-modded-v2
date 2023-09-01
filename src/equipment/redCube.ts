namespace Equipments {
    export class RedCube extends OrbitEquipment {
        getName() { return 'Red Cube'; }
        getDesc() { return `Damage taken is spread over 3 seconds`; }

        constructor() {
            super('equipments/redcube', 'items/redcube');
        }
    
        spreadDamageOverTime = 3;
    }
}
