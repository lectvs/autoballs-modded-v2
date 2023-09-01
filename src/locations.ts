namespace Locations {
    export function getRandomLocation(source: Ball, world: World, side: 'left' | 'right' | 'all', fitnessFunction: (location: Vector2) => number) {
        let randomLocations = A.range(20).map(_ => getLocationCandidate(source, world, side))
                                        .filter(location => isLocationValid(source, world, location, fitnessFunction));

        if (_.isEmpty(randomLocations)) {
            return source.getPosition();
        }

        return M.argmax(randomLocations, location => fitnessFunction(location));
    }

    function getLocationCandidate(source: Ball, world: World, side: 'left' | 'right' | 'all') {
        let bounds: Rect;
        if (side === 'all') {
            bounds = rect(16 + source.physicalRadius, 16 + source.physicalRadius,
                world.width - 32 - 2*source.physicalRadius, world.height - 32 - 2*source.physicalRadius);
        } else if (side === 'left') {
            bounds = rect(16 + source.physicalRadius, 16 + source.physicalRadius,
                world.width/2 - 16 - source.physicalRadius, world.height - 32 - 2*source.physicalRadius);
        } else if (side === 'right') {
            bounds = rect(world.width/2, 16 + source.physicalRadius,
                world.width/2 - 16 - source.physicalRadius, world.height - 32 - 2*source.physicalRadius);
        }

        return vec2(Ball.Random.float(bounds.x, bounds.x + bounds.width),
                    Ball.Random.float(bounds.y, bounds.y + bounds.height));
    }

    function isLocationValid(source: Ball, world: World, location: Vector2, fitnessFunction: (location: Vector2) => number) {
        CHECK_BOUNDS.x = location.x;
        CHECK_BOUNDS.y = location.y;
        CHECK_BOUNDS.radius = source.physicalRadius;

        return _.isEmpty(world.select.overlap(CHECK_BOUNDS, [Battle.PhysicsGroups.walls])) && fitnessFunction(location) > -Infinity;
    }

    const CHECK_BOUNDS = new CircleBounds(0, 0, 0);
}