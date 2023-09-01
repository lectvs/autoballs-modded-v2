/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class Joker extends OrbitEquipment {
        getName() { return 'Joker'; }
        getDesc() { return `Scrambles enemy positions at the start of battle`; }

        used = false;

        constructor() {
            super('equipments/joker', 'items/joker');

            this.addAbility('onPreBattle', Joker.onPreBattle);
        }

        private static onPreBattle(equipment: Joker, source: Ball, world: World) {
            if (world.select.typeAll(Joker).filter(joker => joker.used && joker.getParent()?.team === source.team).length > 0) return;

            let allyBalls = getAllies(world, source);
            let enemyBalls = getEnemies(world, source);
            if (allyBalls.length === 0 || enemyBalls.length === 0) return;

            let flipSide = G.average(...enemyBalls).x > G.average(...allyBalls).x;
            let possiblePositions = getEnemyPositions(world, flipSide);

            let avoidPositions: Pt[] = [];

            let impostors = world.select.typeAll(Balls.Impostor).filter(impostor => impostor.team === source.team);
            avoidPositions.push(...impostors);

            equipment.used = true;

            let script = world.runScript(function*() {
                equipment.setVisible(false);

                let jokerSymbol = world.addWorldObject(new Sprite({
                    p: equipment.orbitingIcon,
                    texture: 'equipments/joker',
                    layer: Battle.Layers.fx,
                }));

                world.playSound('swoosh');
                yield S.tweenPt(1, jokerSymbol, jokerSymbol, vec2(160, source.team === 'friend' ? 110 : 130), Tween.Easing.OutQuad);

                yield S.wait(0.2);

                yield S.either(
                    // Create fog effects
                    function*() {
                        let i = 0;
                        while (true) {
                            let padding = 10;
                            let fog = world.addWorldObject(new Sprite({
                                x: flipSide ? Random.float(world.width/2 + padding, world.width - padding) : Random.float(padding, world.width/2 - padding),
                                y: Random.float(padding, world.height - padding),
                                texture: new AnchoredTexture(Texture.filledCircle(40, 0xFFFFFF, 0.6), 0.5, 0.5),
                                layer: Battle.Layers.fx,
                                tint: Random.element([0xFF0000, 0xFFFF00, 0x0000FF, 0x00FF00]),
                                scale: Random.float(0.5, 0.75),
                            }));

                            if (i % 2 === 0) world.playSound('puff', { volume: 0.7 });
                            i++;

                            fog.runScript(function*() {
                                let pos = fog.getPosition();
                                fog.teleport(jokerSymbol);
                                yield S.simul(
                                    S.tweenPt(0.5, fog, fog, pos, Tween.Easing.OutQuad),
                                    S.tween(0.5, fog, 'scale', 0, 1),
                                );
                                yield S.tween(0.5, fog, 'alpha', 1, 0, Tween.Easing.InQuad);
                            });

                            yield S.wait(0.025);
                        }
                    },
                    // Randomize enemies
                    function*() {
                        yield S.wait(1);

                        for (let i = 0; i < 16; i++) {
                            Ball.Random.shuffle(possiblePositions);
                            let newPositions = getNewEnemyPositions(possiblePositions, avoidPositions, enemyBalls);
        
                            for (let j = 0; j < enemyBalls.length; j++) {
                                enemyBalls[j].teleport(newPositions[j]);
                            }

                            world.playSound('swoosh', { volume: 0.5 });
        
                            yield S.wait(0.1);
                        }
                    },
                );

                yield S.tween(0.5, jokerSymbol, 'alpha', 1, 0);
                jokerSymbol.kill();

                source.unequip();

                if (source.squad && source.squadIndexReference >= 0 && source.squad.balls[source.squadIndexReference].properties.equipment === equipment.equipmentType) {
                    addItemTypeForAlmanacWin(getItemTypeForEquipmentType(equipment.equipmentType));
                    source.squad.balls[source.squadIndexReference].properties.equipment = -1;
                }

                yield S.wait(1);
            });

            equipment.setPreBattleAbilityActiveCheck(() => !script.done);
        }
    }

    function getEnemyPositions(world: World, flipSide: boolean) {
        let result: Vector2[] = [];

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                let v = vec2(M.lerp(32, 144, i/9), M.lerp(32, 208, j/9));
                if (flipSide) {
                    v.x = 320 - v.x;
                }
                result.push(v);
            }
        }

        return result.filter(l => isLocationValid(world, l));
    }

    const CHECK_BOUNDS = new CircleBounds(0, 0, 0);
    function isLocationValid(world: World, location: Vector2) {
        CHECK_BOUNDS.x = location.x;
        CHECK_BOUNDS.y = location.y;
        CHECK_BOUNDS.radius = 16;

        return _.isEmpty(world.select.overlap(CHECK_BOUNDS, [Battle.PhysicsGroups.walls]));
    }

    function getNewEnemyPositions(possiblePositions: Vector2[], avoidPositions: Pt[], enemies: Ball[]) {
        let result: Vector2[] = [];

        let i = 0;
        for (let _ of enemies) {
            while (i < possiblePositions.length && (result.some(l => G.distance(l, possiblePositions[i]) < 20) || avoidPositions.some(l => G.distance(l, possiblePositions[i]) < 32))) {
                i++;
            }

            if (i >= possiblePositions.length) {
                return Ball.Random.shuffle(enemies.map(e => e.getPosition()));
            }

            result.push(possiblePositions[i]);
            i++;
        }

        return result;
    }
}
