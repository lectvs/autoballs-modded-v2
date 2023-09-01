namespace Balls {
    export class Seed extends Ball {
        getName() { return 'Seed'; }
        getDesc() { return `When the shop moves to the next tier, transform into a random ball of that tier`; }
        getShopDmg() { return 1; }
        getShopHp() { return 4; }
        getCredits() { return [CreditsNames.MATERWELONS]; }

        constructor(config: Ball.Config) {
            super('balls/seed', 8, config);

            this.addAbility('onStartShop', Seed.onStartShop, { canActivateTwice: false });
        }

        static onStartShop(source: Ball, world: World) {
            let tierJustUnlocked = getTierJustUnlocked();
            if (tierJustUnlocked < 1) return;

            let validBallTypes = getPurchasableBallTypesForRound(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly)
                                    .filter(t => TYPE_TO_BALL_TYPE_DEF[t].tier === tierJustUnlocked && !_.contains(Seed.INVALID_BALL_TYPES, t));
            if (_.isEmpty(validBallTypes)) return;

            let ballType = Ball.Random.element(validBallTypes);

            ShopActions.removeBallFromSquad(source);
            source.removeFromWorld();

            let newBall = world.addWorldObject(squadBallToWorldBall({
                x: source.x,
                y: source.y,
                properties: {
                    type: ballType,
                    level: source.level,
                    damage: source.dmg,
                    health: source.hp,
                    equipment: source.equipment ? source.equipment.equipmentType : -1,
                    metadata: source.properties.metadata,
                }
            }, GAME_DATA.squad, GAME_DATA.squad.balls.length, source.team));

            newBall.showAllStats();

            GAME_DATA.squad.balls.push({
                x: newBall.x,
                y: newBall.y,
                properties: newBall.properties,
            });
        }

        static INVALID_BALL_TYPES = [
            127,  // Dove
        ];
    }
}