namespace BallItems {
    export class RetroGlasses extends EquipmentItem {
        getName() { return 'Retro Glasses'; }
        getDesc() { return `The equipped ball is significantly more likely to be in the shop on every roll`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/retroglasses', 19);
        }

        canApplyToBall(ball: Ball): boolean {
            let type = ball.properties.type;

            if (!_.contains(getPurchasableBallTypesForRound(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly), type)) return false;
            if (type === 127) return false;  // Dove

            return true;
        }
    }
}