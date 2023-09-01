/// <reference path="./ballItem.ts" />

class EquipmentItem extends BallItem {
    getType(): 'Item' | 'Equipment' { return 'Equipment'; }

    equipmentType: number;
    get mapToEquipmentTypes() { return [this.equipmentType]; }

    constructor(x: number, y: number, texture: string, equipmentType: number) {
        super(x, y, texture);
        this.equipmentType = equipmentType;
    }

    onApplyToBall(ball: Ball): void {
        ball.equip(this.equipmentType);
    }

    isAboutToReplace(ball: Ball): boolean {
        return !!ball.equipment;
    }
}
