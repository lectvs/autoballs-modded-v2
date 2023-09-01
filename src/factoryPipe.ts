namespace FactoryPipe {
    export type BallSpawn = {
        type: number;
        damage: number;
        health: number;
    }
}

class FactoryPipeController extends WorldObject {
    private static readonly MAX_NEUTRAL_BALLS_SPAWNED = 10;

    arenaShrinkFactor = 0;

    constructor(topPipe: FactoryPipe, bottomPipe: FactoryPipe) {
        super();

        let fpc = this;
        this.runScript(function*() {
            let initialWaitForNSeconds = 1;
            let spawnEveryNSeconds = M.mapClamp(GAME_DATA.round, 1, 7, 3, 1.5);

            yield S.waitUntil(() => getBattleState(topPipe.world) === Ball.States.BATTLE);
            yield S.wait(initialWaitForNSeconds);

            let currentPipe = bottomPipe;
            while (true) {
                currentPipe.shoot();

                let waitTime = M.lerp(spawnEveryNSeconds, 1, fpc.arenaShrinkFactor);

                yield S.wait(waitTime);
                yield S.waitUntil(() => topPipe.world.select.tag(Tags.SPAWNED_BY_FACTORY).length < FactoryPipeController.MAX_NEUTRAL_BALLS_SPAWNED);

                currentPipe = currentPipe === bottomPipe ? topPipe : bottomPipe;
            }
        });
    }
}

class FactoryPipe extends Sprite {
    get extend() { return this.scaleY; }
    set extend(v) {
        this.scaleX = 1/v;
        this.scaleY = v;
    }

    private shootScript: Script;

    constructor(x: number, y: number, flipped: boolean) {
        super({
            x, y,
            texture: 'factorypipe',
            flipY: flipped,
            layer: Battle.Layers.walls,
            effects: { outline: {} },
        });
    }

    shoot() {
        if (this.shootScript && !this.shootScript.done) return;

        let pipe = this;
        this.shootScript = this.runScript(function*() {
            yield S.tween(1, pipe, 'extend', 1, 0.7);
            pipe.world.playSound('shoot', { speed: 0.5, humanized: false });
            yield S.tween(0.05, pipe, 'extend', 0.7, 1.5, Tween.Easing.OutQuad);

            pipe.summonNeutralBall(pipe.flipY);

            yield S.tween(0.1, pipe, 'extend', 1.5, 0.9, Tween.Easing.InOutQuad);
            yield S.tween(0.1, pipe, 'extend', 0.9, 1, Tween.Easing.InQuad);
        });
    }

    private summonNeutralBall(flipped: boolean) {
        let spawnSpecial = Ball.Random.boolean(0.2);
        let ballSpawn = spawnSpecial ? Ball.Random.element(FactoryPipe.BALL_SPAWNS) : FactoryPipe.BALL_SPAWNS[0];
        
        let ball = this.world.addWorldObject(squadBallToWorldBall({
            x: this.x,
            y: this.y + (flipped ? -40 : 40),
            properties: {
                type: ballSpawn.type,
                level: 1,
                damage: ballSpawn.damage,
                health: ballSpawn.health,
                equipment: -1,
                metadata: {},
            },
        }, undefined, -1, 'neutral'));

        ball.v.set(Ball.Random.float(-50, 50), flipped ? -150 : 150);
        ball.neutralFlowDirection = Ball.Random.sign();
        ball.addTag(Tags.SPAWNED_BY_FACTORY);
    }

    static BALL_SPAWNS: FactoryPipe.BallSpawn[] = [
        { // Normal
            type: 0,
            damage: 1,
            health: 2,
        },
        // { // Crusher
        //     type: 4,
        //     damage: 0,
        //     health: 6,
        // },
        { // Grenade
            type: 7,
            damage: 1,
            health: 0,
        },
        { // Turret
            type: 11,
            damage: 0,
            health: 6,
        },
        // { // Zombie
        //     type: 15,
        //     damage: 1,
        //     health: 3,
        // },
        { // Black Hole
            type: 108,
            damage: 0,
            health: 10,
        },
        // { // Zoomer
        //     type: 110,
        //     damage: 1,
        //     health: 4,
        // },
        // { // Fragmenter
        //     type: 112,
        //     damage: 2,
        //     health: 2,
        // },
        // { // Fireball
        //     type: 119,
        //     damage: 0,
        //     health: 6,
        // },
    ];
}