/// <reference path="./equipmentItem.ts" />

namespace BallItems {
    export class CatEars extends EquipmentItem {
        getName() { return 'Cat Ears'; }
        getDesc() { return `They do nothing, but I've been told cute cosmetics increase in-app purchase sales??`; }
        getShopCost() { return 0; }

        constructor(x: number, y: number) {
            super(x, y, 'items/catears', 4);
        }
    }
}