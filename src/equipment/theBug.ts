namespace Equipments {
    export class TheBug extends OrbitEquipment {
        getName() { return 'The Bug'; }
        getDesc() { return `Transforms into a random shop ball on restock`; }

        constructor() {
            super('equipments/thebug', 'items/thebug');

            this.orbitingIcon.effects.post.filters.push(new Effects.Filters.Glitch(4, 2, 2));

            this.addAbility('onRestock', TheBug.onRestock);
        }

        private static onRestock(equipment: TheBug, source: Ball, world: World) {
            let validBallTypes = getPurchasableBallTypesForRound(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly)
                .filter(t => {
                    if (t === source.properties.type) return false;
                    if (_.contains(TheBug.INVALID_BALL_TYPES, t)) return false;
                    if (GAME_DATA.lap > 1 && source.level > 3 && (_.contains(Shop.NO_TIER_CROWN_LEVEL_MUTATION_BALLS, t) || _.contains(Shop.REDUCED_TIER_CROWN_LEVEL_MUTATION_BALLS, t))) return false;
                    return true;
                });
            if (_.isEmpty(validBallTypes)) return;

            let ballType = Ball.Random.element(validBallTypes);

            let isInSquad = source.squadIndexReference >= 0;

            if (isInSquad) ShopActions.removeBallFromSquad(source);
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

            world.runScript(function*() {
                let g = new Effects.Filters.Glitch(8, 4, 4);
                g.setUniform('t', Random.float(0, 10));
                newBall.effects.post.filters.push(g);

                let glitchSound = world.playSound('arg/glitch_dialog', { limit: 1 });
                glitchSound.volume = 0.5;
                yield S.wait(0.3);
                glitchSound.stop();

                A.removeAll(newBall.effects.post.filters, g);
            });

            if (isInSquad) {
                GAME_DATA.squad.balls.push({
                    x: newBall.x,
                    y: newBall.y,
                    properties: newBall.properties,
                });
            }
        }

        static INVALID_BALL_TYPES = [
            127,  // Dove
        ];
    }
}
