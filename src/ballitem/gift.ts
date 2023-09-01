namespace BallItems {
    export class Gift extends BallItem {
        getName() { return 'A Gift'; }
        getDesc() { return `Happy Birthday!`; }
        getShopCost() { return 0; }
    
        constructor(x: number, y: number) {
            super(x, y, 'items/gift');
        }
    
        onApplyToBall(ball: Ball): void {
            let choices = [
                () => this.giveBuff(ball),
                () => this.giveEquipment(ball),
            ];

            Ball.Random.elementWeighted(choices, [0.2, 0.8])();
        }

        private giveBuff(ball: Ball) {
            let buff = Ball.Random.element([
                { dmg: 2, hp: 0 },
                { dmg: 0, hp: 2 },
                { dmg: 1, hp: 1 },
            ]);
            this.world.addWorldObject(new Buff(this.x, this.y, ball, buff));
            return true;
        }

        private giveEquipment(ball: Ball) {
            let currentTier = getShopTierForRound(GAME_DATA.round);
            let possibleEquipments = _.flatten([1,2,3,4].filter(i => i <= currentTier).map(tier => getPurchasableEquipmentTypesForExactTier(tier))) as number[];
            if (_.isEmpty(possibleEquipments)) {
                return false;
            }
            this.world.addWorldObject(new RandomEquipment(this.x, this.y, ball, ball, Ball.Random.element(possibleEquipments), false, allies => undefined, Utils.NOOP));
            return true;
        }
    }
}
