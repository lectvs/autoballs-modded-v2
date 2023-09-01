/// <reference path="./equipmentItem.ts" />

namespace BallItems {
    export class ArmorPlating extends EquipmentItem {
        getName() { return 'Armor Plating'; }
        getDesc() { return `Decrease all instances of damage taken by 2 (cannot decrease damage below 0.75)`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/armorplating', 3);
        }
    }
}