class YourTeamWorld extends Sprite {
    containedWorld: World;

    constructor(world: World, config: Sprite.Config = {}) {
        super({
            texture: new BasicTexture(world.width, world.height, 'YourTeamWorld.texture'),
            useGlobalTime: true,
            ...config,
        });

        this.containedWorld = world;
    }

    update(): void {
        super.update();
        this.containedWorld.update();
    }

    render(texture: Texture, x: number, y: number): void {
        this.getTexture().clear();
        this.containedWorld.render(this.getTexture(), 0, 0);
        super.render(texture, x, y);
    }
}

function createTeamWorld(squad?: Squad, squadY: number = 0, viewable: boolean = true) {
    let world = new World({
        backgroundAlpha: 0,
        layers: [
            { name: Battle.Layers.balls },
            { name: Battle.Layers.infobox },
        ],
        physicsGroups: { [Battle.PhysicsGroups.balls]: {} },
    });

    if (viewable) {
        world.addWorldObject(new BallHighlighter());
        world.addWorldObject(new InfoBox());
    }
    world.addWorldObject(new AbilitySystem());

    if (squad) {
        addSquadToTeamWorld(world, squadY, squad, 'friend', false);
    }

    let yourTeamWorld = new YourTeamWorld(world, { alpha: 0 });

    return yourTeamWorld;
}

function addSquadToTeamWorld(world: World, ballY: number, squad: Squad, team: Ball.Team, flipped: boolean) {
    if (squad.balls.length === 0) {
        world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: ballY,
            text: '?????',
            anchor: Vector2.CENTER,
        }));
    } else {
        let positions = getYourSquadBallPositions(squad.balls, flipped);
        for (let i = 0; i < squad.balls.length; i++) {
            let ball = world.addWorldObject(squadBallToWorldBall(squad.balls[i], squad, i, team));
            ball.x = global.gameWidth/2 + positions[i].x;
            ball.y = ballY + positions[i].y;
            ball.colliding = false;
            ball.isInYourSquadScene = true;
            ball.showAllStats();
        }
    }
}

function getYourSquadBallPositions(balls: SquadBall[], flipped: boolean) {
    let d = flipped ? -1 : 1;
    if (balls.length === 0) return [];
    if (balls.length === 1) return [vec2(0, 0)];
    if (balls.length === 2) return [vec2(-32, 0), vec2(32, 0)];
    if (balls.length === 3) return [vec2(-64, 0), vec2(0, 0), vec2(64, 0)];

    let scale = 16;
    if (balls.length >= 9) scale = 14;

    return balls.map((_, i) => vec2(scale - scale*balls.length + 2*scale*i, -10 * (-1)**i * d));
}