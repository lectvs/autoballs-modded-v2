class Dio extends Sprite {
    constructor(x: number, y: number, ballToRevive: Ball, health: number, damage: number) {
        super({
            x, y,
            texture: 'necromancerbeams',
            layer: Battle.Layers.fx,
            vangle: 180,
            scale: 0,
            tags: [Tags.DELAY_RESOLVE(ballToRevive.team), Tags.FORCE_DELAY_RESOLVE],
        });

        let dio = this;
        this.runScript(function*() {
            yield S.tween(0.3, dio, 'scale', 0, 16/64, Tween.Easing.OutBounce(1));

            let sprite = dio.addChild(new Sprite({
                texture: 'items/bestfriend',
                alpha: 0,
                update: function() {
                    this.offsetX = Random.float(-1, 1);
                }
            }));

            dio.world.playSound('diocharge', { humanized: false });
            yield S.tween(1, sprite, 'alpha', 0, 0.5, Tween.Easing.OutQuad);
            yield S.wait(1.5);

            dio.world.playSound('dioboom', { humanized: false });
            let ball = dio.world.addWorldObject(squadBallToWorldBall({
                x: dio.x,
                y: dio.y,
                properties: {
                    type: ballToRevive.properties.type,
                    damage: damage,
                    health: health,
                    equipment: -1,
                    level: ballToRevive.level,
                    metadata: ballToRevive.properties.metadata,
                },
            }, ballToRevive.squad, ballToRevive.squadIndexReference, ballToRevive.team));
            ball.afterAddImmuneTime = 0.5;
            ball.timesKilledEnemy = ballToRevive.timesKilledEnemy;

            ball.world.addWorldObject(new BurstPuffSystem({
                x: ball.x,
                y: ball.y,
                layer: Battle.Layers.fx,
                puffCount: Math.floor(10 * getParticleLevel()),
                puffConfigFactory: () => ({
                    maxLife: 0.7,
                    v: Random.inCircle(80),
                    color: 0xEC77FF,
                    finalColor: 0x57007F,
                    radius: 4,
                    finalRadius: 0,
                }),
            }));

            dio.kill();
        });

        
    }
}