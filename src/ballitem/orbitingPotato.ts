namespace BallItems {
    export class OrbitingPotato extends BallItem {
        getName() { return 'Orbiting Potato'; }
        getDesc() { return `Gain an orbiting potato that deals [r]5<sword>/s[/r] to enemies and can block projectiles\n\nCan equip up to 3 potatoes at the same time`; }

        getType(): 'Item' | 'Equipment' { return 'Equipment'; }

        get mapToEquipmentTypes() { return [21, 22, 23]; }
        
        constructor(x: number, y: number) {
            super(x, y, 'items/orbitingpotato');
        }

        canApplyToBall(ball: Ball): boolean {
            if (ball.equipment && ball.equipment.equipmentType === 23) return false;
            return true;
        }

        onApplyToBall(ball: Ball): void {
            if (ball.equipment && ball.equipment.equipmentType === 21) ball.equip(22);
            else if (ball.equipment && ball.equipment.equipmentType === 22) ball.equip(23);
            else ball.equip(21);
        }

        isAboutToReplace(ball: Ball): boolean {
            if (!ball.equipment) return false;
            if (ball.equipment.equipmentType === 21 || ball.equipment.equipmentType === 22 || ball.equipment.equipmentType === 23) return false;
            return true;
        }
    }
}