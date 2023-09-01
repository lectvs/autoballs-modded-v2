namespace Arenas {
    export const PARENT_NAME = 'arenaParent';
    export const BG_NAME = 'arenaBg';

    export const ARENA_FIRST = 'first';
    export const ARENA_BDAY = 'bday';
    export const ARENA_SPACE = 'space';
    export const ARENA_FACTORY = 'factory';
    export const ARENA_ICE = 'ice';
    export const ARENA_GRAVITY = 'gravity';
    export const ARENAS = [ARENA_FIRST, ARENA_BDAY, ARENA_SPACE, ARENA_FACTORY, ARENA_ICE, ARENA_GRAVITY];

    export function BASE() {
        let world = new World({
            backgroundColor: 0x000000,
            camera: {
                mode: Camera.Mode.FOCUS(global.gameWidth/2, global.gameHeight/2),
                movement: Camera.Movement.SNAP()
            },
            layers: [
                { name: Battle.Layers.bg },
                { name: Battle.Layers.ground },
                { name: Battle.Layers.onground },
                { name: Battle.Layers.walls },
                { name: Battle.Layers.balls },
                { name: Battle.Layers.fx },
                { name: Battle.Layers.fg },
                { name: Battle.Layers.playernames },
                { name: Battle.Layers.ui },
                { name: Battle.Layers.drag },
                { name: Battle.Layers.infobox },
                { name: Battle.Layers.warning },
            ],
            physicsGroups: {
                [Battle.PhysicsGroups.walls]: {},
                [Battle.PhysicsGroups.balls]: {},
                [Battle.PhysicsGroups.balls_ethereal]: {},
                [Battle.PhysicsGroups.droppables]: {},
            },
            collisions: [
                { move: Battle.PhysicsGroups.balls, from: Battle.PhysicsGroups.walls, momentumTransfer: 'elastic' },
                { move: Battle.PhysicsGroups.balls_ethereal, from: Battle.PhysicsGroups.walls, momentumTransfer: 'elastic' },
                { move: Battle.PhysicsGroups.balls, from: Battle.PhysicsGroups.balls, momentumTransfer: 'elastic', callback: Ball.handleCollision },
                { move: Battle.PhysicsGroups.droppables, from: Battle.PhysicsGroups.walls, momentumTransfer: 'elastic' },
            ],
            collisionIterations: 4,
            // TODO: why does this work?
            useRaycastDisplacementThreshold: Infinity, //4,
            maxDistancePerCollisionStep: 16,
            minDistanceIgnoreCollisionStepCalculation: 400,
            globalSoundHumanizePercent: 0.1,
        });

        world.addWorldObject(new Sprite({
            texture: Texture.filledRect(world.width, world.height, 0xFFFFFF),
            layer: Battle.Layers.bg,
        }));

        // Walls
        world.addWorldObject(new PhysicsWorldObject({
            physicsGroup: Battle.PhysicsGroups.walls,
            bounds: new InvertedRectBounds(0, 0, world.width, world.height),
            immovable: true,
        }));

        // Flow
        world.addWorldObject(new FlowHolder(Flow.GET_FIXED_FLOW_TEXTURE()));

        // Non-Update
        world.nonUpdateCallback = function() {
            this.select.type(BallHighlighter, false)?.update();
            this.select.type(InfoBox, false)?.update();
        }

        return world;
    }

    function CLEAR_OLD_ARENA(world: World) {
        world.select.name(Arenas.PARENT_NAME, false)?.removeFromWorld();
        world.data.arenaName = undefined;
        world.data.onBattleStart = undefined;

        A.filterInPlace(world.getLayerByName(Battle.Layers.walls).effects.post.filters, filter => !(filter instanceof ArenaFirstFilter));
        A.filterInPlace(world.getLayerByName(Battle.Layers.ground).effects.post.filters, filter => !(filter instanceof BulgeFilter) && !(filter instanceof AddBlueFilter));
    }

    function NEW_ARENA_PARENT(world: World) {
        return world.addWorldObject(new WorldObject({
            name: Arenas.PARENT_NAME,
        }));
    }

    export function SET_FOR_ARENA(world: World, arena: string) {
        if (arena === Arenas.ARENA_BDAY) {
            SET_BDAY(world);
        } else if (arena === Arenas.ARENA_SPACE) {
            SET_SPACE(world);
        } else if (arena === Arenas.ARENA_ICE) {
            SET_ICE(world);
        } else if (arena === Arenas.ARENA_GRAVITY) {
            SET_GRAVITY(world);
        } else if (arena === Arenas.ARENA_FACTORY) {
            SET_FACTORY(world);
        } else {
            SET_FIRST(world);
        }
    }

    function SET_FIRST(world: World) {
        CLEAR_OLD_ARENA(world);
        let arenaParent = NEW_ARENA_PARENT(world);

        world.data.arenaName = ARENA_FIRST;

        // BG
        arenaParent.addChild(new Sprite({
            name: BG_NAME,
            texture: world.select.type(FlowHolder).flowTexture,
            effects: { post: { filters: [new FlowFilter(0.05)] } },
            alpha: 0.55,
            layer: Battle.Layers.ground,
        }));

        // Collision
        arenaParent.addChild(new ArenaShrink());

        arenaParent.addChild(Parts.circle(world.width/2, world.height/2, 30));

        let borderThickness = 16;
        world.addWorldObject(new PhysicsWorldObject({
            physicsGroup: Battle.PhysicsGroups.walls,
            bounds: new InvertedRectBounds(borderThickness, borderThickness, world.width - 2*borderThickness, world.height - 2*borderThickness),
            immovable: true,
        }));

        let trapWidth = 132;
        let trapHeight = 32;
        arenaParent.addChild(Parts.trapezoidV(world.width/2 - trapWidth/2, 0, trapWidth, trapWidth - trapHeight*2, trapHeight));
        arenaParent.addChild(Parts.trapezoidV(world.width/2 - trapWidth/2, world.height - trapHeight, trapWidth - trapHeight*2, trapWidth, trapHeight));

        // Decoration
        arenaParent.addChild(new Sprite({
            texture: 'arena1_walls',
            layer: Battle.Layers.walls,
        }));
        arenaParent.addChild(new Sprite({
            x: world.width/2, y: world.height/2,
            texture: 'centerblades',
            layer: Battle.Layers.walls,
            vangle: 720,
        }));

        world.getLayerByName(Battle.Layers.walls).effects.post.filters.push(new ArenaFirstFilter());
    }

    function SET_BDAY(world: World) {
        CLEAR_OLD_ARENA(world);
        let arenaParent = NEW_ARENA_PARENT(world);

        world.data.arenaName = ARENA_BDAY;

        // BG
        arenaParent.addChild(new Sprite({
            name: BG_NAME,
            texture: 'arena_bday_bg',
            layer: Battle.Layers.ground,
            effects: { post: { filters: [new FlipbookFilter(1, 0.2, 60, 2), new BulgeFilter(0), new ArenaBdayShadeFilter()] }},
        }));

        // Collision
        arenaParent.addChild(new ArenaShrinkBday());

        let borderThickness = 16;
        arenaParent.addChild(new PhysicsWorldObject({
            physicsGroup: Battle.PhysicsGroups.walls,
            bounds: new InvertedRectBounds(borderThickness, borderThickness, world.width - 2*borderThickness, world.height - 2*borderThickness),
            immovable: true,
        }));

        let trapWidth = 132;
        let trapHeight = 32;
        arenaParent.addChild(Parts.trapezoidV(world.width/2 - trapWidth/2, 0, trapWidth, trapWidth - trapHeight*2, trapHeight));
        arenaParent.addChild(Parts.trapezoidV(world.width/2 - trapWidth/2, world.height - trapHeight, trapWidth - trapHeight*2, trapWidth, trapHeight));

        // Decoration
        arenaParent.addChild(new Sprite({
            x: -10, y: -10,
            texture: 'arena_bday_walls',
            layer: Battle.Layers.fg,
            effects: { post: { filters: [new FlipbookFilter(2, 0.1, 120, 1.5)] }},
        }));
        arenaParent.addChild(new Sprite({
            x: -10, y: -10,
            texture: 'arena_bday_deco',
            layer: Battle.Layers.fg,
            effects: { pre: { filters: [new FlipbookFilter(1, 1, 2, 1.5)] }, outline: {} },
        }));

        if (!IS_MOBILE) arenaParent.addChild(new BdayBallTrail());
    }

    function SET_SPACE(world: World) {
        CLEAR_OLD_ARENA(world);
        let arenaParent = NEW_ARENA_PARENT(world);

        world.data.arenaName = ARENA_SPACE;

        arenaParent.addChildren(lciDocumentToWorldObjects('arena_space'));

        // Collision
        arenaParent.addChild(new PhysicsWorldObject({
            x: world.width/2, y: world.height/2,
            layer: Battle.Layers.walls,
            physicsGroup: Battle.PhysicsGroups.walls,
            immovable: true,
            bounds: new InvertedCircleBounds(0, 0, 112),
        }));

        let centerBlackHole = arenaParent.addChild(new CenterBlackHole(global.gameWidth/2, global.gameHeight/2, 0));
        centerBlackHole.updateCallback = function() {
            if (getBattleState(this.world) === Ball.States.BATTLE) {
                this.gravityFactor = M.moveToClamp(this.gravityFactor, ArenaShrinkSpace.BASE_GRAVITY_FACTOR, ArenaShrinkSpace.BASE_GRAVITY_FACTOR, this.delta);
            }
        }

        let blackHole = world.select.name<Sprite>('blackhole');
        blackHole.scale = ArenaShrinkSpace.BASE_BLACK_HOLE_SCALE;
        blackHole.vangle = 30;

        arenaParent.addChild(new ArenaShrinkSpace(centerBlackHole, blackHole));

        let perlin = new Perlin();

        let starAlphaMin = -0.5;
        let starAlphaMax = 1.5;
        let starAlphaSpeed = 0.5;

        world.select.name<Sprite>('stars1').updateCallback = function() {
            this.alpha = M.map(perlin.get(this.life.time * starAlphaSpeed, 5.5), -1, 1, starAlphaMin, starAlphaMax);
        }

        world.select.name<Sprite>('stars2').updateCallback = function() {
            this.alpha = M.map(-perlin.get(this.life.time * starAlphaSpeed, 5.5), -1, 1, starAlphaMin, starAlphaMax);
        }

        let bf = new BulgeFilter(0, 0.6);
        world.getLayerByName(Battle.Layers.ground).effects.post.filters.push(bf);
        world.select.name<Sprite>(BG_NAME).updateCallback = function() {
            bf.bulgeAmount = M.map(perlin.get(this.life.time*2), -1, 1, 0, 0.2);
        }
    }

    function SET_ICE(world: World) {
        CLEAR_OLD_ARENA(world);
        let arenaParent = NEW_ARENA_PARENT(world);

        world.data.arenaName = ARENA_ICE;

        // BG
        arenaParent.addChild(new Sprite({
            name: BG_NAME,
            texture: world.select.type(FlowHolder).flowTexture,
            effects: { post: { filters: [new FlowFilter(0.05, 0)] } },
            alpha: 0.55,
            layer: Battle.Layers.ground,
        }));

        arenaParent.addChildren(lciDocumentToWorldObjects('arena_ice'));

        // Collision
        arenaParent.addChild(Parts.circle(world.width/2, world.height/2, 30));

        let borderThickness = 16;
        arenaParent.addChild(new PhysicsWorldObject({
            physicsGroup: Battle.PhysicsGroups.walls,
            bounds: new InvertedRectBounds(borderThickness, borderThickness, world.width - 2*borderThickness, world.height - 2*borderThickness),
            immovable: true,
        }));

        let trapWidth = 132;
        let trapHeight = 32;
        arenaParent.addChild(Parts.trapezoidV(world.width/2 - trapWidth/2, 0, trapWidth, trapWidth - trapHeight*2, trapHeight));
        arenaParent.addChild(Parts.trapezoidV(world.width/2 - trapWidth/2, world.height - trapHeight, trapWidth - trapHeight*2, trapWidth, trapHeight));

        let arenaShrinkIce = arenaParent.addChild(new ArenaShrinkIce());

        // Decoration
        arenaParent.addChild(new Sprite({
            texture: 'arena1_walls',
            layer: Battle.Layers.walls,
        }));
        arenaParent.addChild(new Sprite({
            x: world.width/2, y: world.height/2,
            texture: 'centerblades',
            layer: Battle.Layers.walls,
            update: function() {
                let falloff = 16;
                this.timeScale = arenaShrinkIce.iceFansMultiplier;
                this.angle = 30 + 10 * M.periodic(x => (x < 1 ? x : 1-(x-1)/falloff), 1+falloff)(this.life.time * 30);
            },
        }));

        world.getLayerByName(Battle.Layers.ground).effects.post.filters.push(new AddBlueFilter(0.8));
        world.getLayerByName(Battle.Layers.walls).effects.post.filters.push(new ArenaFirstFilter());
    }

    function SET_GRAVITY(world: World) {
        CLEAR_OLD_ARENA(world);
        let arenaParent = NEW_ARENA_PARENT(world);

        world.data.arenaName = ARENA_GRAVITY;

        world.data.onBattleStart = () => {
            for (let ball of world.select.typeAll(Ball)) {
                ball.v.y += 1;
            }
        }

        // Collision
        let borderThickness = 16;
        arenaParent.addChild(new PhysicsWorldObject({
            physicsGroup: Battle.PhysicsGroups.walls,
            bounds: new InvertedRectBounds(borderThickness, 0, world.width - 2*borderThickness, world.height),
            immovable: true,
        }));

        arenaParent.addChild(new Trampoline(80, 153, false));
        arenaParent.addChild(new Trampoline(240, 153, true));

        arenaParent.addChildren(lciDocumentToWorldObjects('arena_gravity'));

        let ceiling = world.select.name<Sprite>('ceiling');

        arenaParent.addChild(new ArenaShrinkGravity(ceiling));
    }

    function SET_FACTORY(world: World) {
        CLEAR_OLD_ARENA(world);
        let arenaParent = NEW_ARENA_PARENT(world);

        world.data.arenaName = ARENA_FACTORY;

        arenaParent.addChildren(lciDocumentToWorldObjects('arena_factory'));

        world.select.name<Sprite>('wires').effects.post.filters.push(new FlowFilterFactory());

        // Collision
        arenaParent.addChild(Parts.circle(world.width/2, world.height/2, 30));

        let borderThickness = 16;
        world.addWorldObject(new PhysicsWorldObject({
            physicsGroup: Battle.PhysicsGroups.walls,
            bounds: new InvertedRectBounds(borderThickness, borderThickness, world.width - 2*borderThickness, world.height - 2*borderThickness),
            immovable: true,
        }));

        let trapWidth = 32;
        let trapHeight = 132;
        arenaParent.addChild(Parts.trapezoidH(0, world.height/2 - trapHeight/2, trapHeight, trapHeight - trapWidth*2, trapWidth));
        arenaParent.addChild(Parts.trapezoidH(world.width - trapWidth, world.height/2 - trapHeight/2, trapHeight - trapWidth*2, trapHeight, trapWidth));

        let hourHand = world.select.name<Sprite>('hourhand');
        let minuteHand = world.select.name<Sprite>('minutehand');

        hourHand.vangle = ArenaShrinkFactory.INITIAL_VANGLE_HOUR;
        minuteHand.vangle = ArenaShrinkFactory.INITIAL_VANGLE_MINUTE;

        let topPipe = arenaParent.addChild(new FactoryPipe(world.width/2, 0, false));
        let bottomPipe = arenaParent.addChild(new FactoryPipe(world.width/2, world.height, true));
        let factoryPipeController = arenaParent.addChild(new FactoryPipeController(topPipe, bottomPipe));

        arenaParent.addChild(new ArenaShrinkFactory(factoryPipeController, hourHand, minuteHand));
    }

    export function translateCoordinate(v: Vector2, fromArena: string, toArena: string) {
        v = vec2(v);
        if (fromArena === toArena) return v;
        if (!_.contains(ARENAS, fromArena) || !_.contains(ARENAS, toArena)) return v;
        if (fromArena === Arenas.ARENA_ICE && toArena === Arenas.ARENA_FIRST) return v;
        if (fromArena === Arenas.ARENA_FIRST && toArena === Arenas.ARENA_ICE) return v;

        let polar = v.subtract(160, 120).toPolar();

        let fromPolarization = getArenaPolarizationForAngle(fromArena, polar.angle);
        let toPolarization = getArenaPolarizationForAngle(toArena, polar.angle);

        polar.radius = M.map(polar.radius, fromPolarization.near, fromPolarization.far, toPolarization.near, toPolarization.far);

        return polar.toCartesian().add(160, 120);
    }

    const ARENA_POLARIZATION_FOOTPRINTS: Dict<{ near: number, far: number }[]> = {};
    export function loadArenaPolarizationFootprints() {
        for (let arena of ARENAS) {
            if (arena in ARENA_POLARIZATION_FOOTPRINTS) continue;

            let world = BASE();
            SET_FOR_ARENA(world, arena);

            let hasCenter = world.select.overlap(new RectBounds(world.width/2-1, world.height/2-1, 2, 2), [Battle.PhysicsGroups.walls]).length > 0;

            let result: { near: number, far: number }[] = [];
            for (let angle = 0; angle < 360; angle++) {
                let walls = world.select.raycast(world.width/2, world.height/2, M.cos(angle), M.sin(angle), [Battle.PhysicsGroups.walls]);
                if (hasCenter) {
                    result.push({ near: walls[0].t, far: walls[1].t });
                } else {
                    result.push({ near: 0, far: walls[0].t });
                }
            }

            ARENA_POLARIZATION_FOOTPRINTS[arena] = result;
        }
    }

    export function getArenaPolarizationForAngle(arena: string, angle: number) {
        angle = M.mod(angle, 360);
        let i = Math.floor(angle);
        let j = Math.ceil(angle);

        return {
            near: angle === i ? ARENA_POLARIZATION_FOOTPRINTS[arena][i % 360].near
                              : M.map(angle, i, j, ARENA_POLARIZATION_FOOTPRINTS[arena][i % 360].near, ARENA_POLARIZATION_FOOTPRINTS[arena][j % 360].near),
            far: angle === i ? ARENA_POLARIZATION_FOOTPRINTS[arena][i % 360].far
                              : M.map(angle, i, j, ARENA_POLARIZATION_FOOTPRINTS[arena][i % 360].far, ARENA_POLARIZATION_FOOTPRINTS[arena][j % 360].far),
        };
    }
}