namespace Balls {
    export class Mechanic extends Ball {
        getName() { return 'Mechanic'; }
        getDesc() {
            return `Gives [lb]${this.equipmentsToGive}[/lb] [color ${getColorForTier(this.equipmentTier)}]Tier ${'I'.repeat(this.equipmentTier)}[/color] equipments to random unequipped allies`;
        }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }

        get equipmentTier() { return Math.min(this.level, 3); }
        get equipmentsToGive() { return this.level <= 3 ? 2 : this.level - 1; }

        private equipmentsGiven: number = 0;

        constructor(config: Ball.Config) {
            super('balls/mechanic', 8, config);

            this.addAbility('onPreBattle', Mechanic.onPreBattle);
            this.addAbility('update', Mechanic.update);
        }

        onStateChangePreBattle() {
            this.equipmentsGiven = 0;
        }

        private static onPreBattle(source: Mechanic, world: World) {
            Mechanic.attemptGiveEquipmentsToAllies(source, world);
        }

        private static update(source: Mechanic, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            Mechanic.attemptGiveEquipmentsToAllies(source, world);
        }

        private static attemptGiveEquipmentsToAllies(source: Mechanic, world: World) {
            let currentRandomEquipments = world.select.typeAll(RandomEquipment);
            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.equipment && !currentRandomEquipments.some(re => re.target === ball));
            if (validBalls.length === 0) return;

            let equipmentsLeftToGive = source.equipmentsToGive - source.equipmentsGiven;

            if (validBalls.length > equipmentsLeftToGive) {
                Ball.Random.shuffle(validBalls);
                validBalls = validBalls.slice(0, equipmentsLeftToGive);
            }
            
            let res: RandomEquipment[] = [];
            for (let ball of validBalls) {
                let possibleEquipments = getPurchasableEquipmentTypesForExactTier(source.equipmentTier).filter(e => !_.contains(Mechanic.USELESS_EQUIPMENT_TYPES, e));
                if (_.isEmpty(possibleEquipments)) {
                    return;
                }
                let re = world.addWorldObject(new RandomEquipment(source.x, source.y, source, ball, Ball.Random.element(possibleEquipments), true, allies => {
                    let cre = world.select.typeAll(RandomEquipment);
                    let validAllies = allies.filter(ally => ally !== source && !ally.equipment && !cre.some(re => re.target === ball));
                    return Ball.Random.element(validAllies);
                }, () => {
                    source.equipmentsGiven--;
                }));
                res.push(re);
            }

            if (res.length > 0) {
                world.playSound('sellball', { limit: 2 });
            }

            source.equipmentsGiven += validBalls.length;

            source.setPreBattleAbilityActiveCheck(() => res.some(re => re.world));
        }

        static USELESS_EQUIPMENT_TYPES = [
            4,  // Cat Ears
            8,  // Hyper Driver
            10, // Thief Mask
            18, // VIP Ticket
            19, // Retro Glasses
            32, // Contagion
            37, // Joker
            41, // The Bug
            42, // Mocha
        ];
    }
}