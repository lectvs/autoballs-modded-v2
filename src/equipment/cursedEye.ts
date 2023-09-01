/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class CursedEye extends OrbitEquipment {
        getName() { return 'Cursed Eye'; }
        getDesc() { return `Teleports away from enemies when it takes discrete damage`; }

        constructor() {
            super('equipments/cursedeye', 'items/cursedeye');

            this.addAbility('onTakeDamage', CursedEye.onTakeDamage);
        }

        private static onTakeDamage(equipment: CursedEye, source: Ball, world: World, damage: number) {
            if (source.hp <= 0) return;

            let teleportLocation = CursedEye.getTeleportLocation(source, world);
            let oldLocation = source.getPosition();

            source.teleport(teleportLocation);

            world.runScript(function*() {
                let radius = M.clamp(Math.floor(source.physicalRadius), 8, 16);
                let maxScaleY = 10;

                let teleport1 = world.addWorldObject(new Sprite({
                    x: oldLocation.x, y: oldLocation.y,
                    texture: new AnchoredTexture(Texture.filledCircle(radius, 0xFFFFFF), 0.5, 0.5),
                    layer: Battle.Layers.fx,
                }));

                let teleport2 = world.addWorldObject(new Sprite({
                    x: teleportLocation.x, y: teleportLocation.y,
                    texture: new AnchoredTexture(Texture.filledCircle(radius, 0xFFFFFF), 0.5, 0.5),
                    layer: Battle.Layers.fx,
                    scaleX: 1 / maxScaleY,
                    scaleY: maxScaleY,
                    offsetY: -maxScaleY * radius,
                }));

                world.playSound('pew', { humanized: false });

                yield S.doOverTime(0.1, t => {
                    teleport1.scaleY = M.lerp(1, maxScaleY, Tween.Easing.InQuad(t));
                    teleport1.scaleX = 2 / teleport1.scaleY;
                    teleport1.offsetY = -teleport1.scaleY * radius;

                    teleport2.scaleY = M.lerp(maxScaleY, 1, t);
                    teleport2.scaleX = 2 / teleport2.scaleY;
                    teleport2.offsetY = -teleport2.scaleY * radius;
                });

                teleport1.kill();
                teleport2.kill();
            });
        }

        private static getTeleportLocation(source: Ball, world: World) {
            let randomLocations = A.range(20).map(_ => CursedEye.getRandomLocation(source, world))
                                            .filter(location => CursedEye.isLocationValid(source, world, location));

            if (_.isEmpty(randomLocations)) {
                return source.getPosition();
            }

            let enemies = getEnemies(world, source);

            return M.argmax(randomLocations, location => CursedEye.locationFitnessFunction(location, enemies));
        }

        private static getRandomLocation(source: Ball, world: World) {
            return vec2(Ball.Random.float(16 + source.physicalRadius, world.width - 16 - source.physicalRadius),
                        Ball.Random.float(16 + source.physicalRadius, world.height - 16 - source.physicalRadius));
        }

        private static isLocationValid(source: Ball, world: World, location: Vector2) {
            CursedEye.CHECK_BOUNDS.x = location.x;
            CursedEye.CHECK_BOUNDS.y = location.y;
            CursedEye.CHECK_BOUNDS.radius = source.physicalRadius;

            return _.isEmpty(world.select.overlap(CursedEye.CHECK_BOUNDS, [Battle.PhysicsGroups.walls]));
        }

        private static locationFitnessFunction(location: Vector2, enemies: Ball[]) {
            return M.min(enemies, enemy => G.distance(enemy, location));
        }

        private static CHECK_BOUNDS = new CircleBounds(0, 0, 0);
    }
}
