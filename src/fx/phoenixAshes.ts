class PhoenixAshes extends Sprite {
    constructor(x: number, y: number, ballToRevive: Balls.Phoenix, health: number, damage: number) {
        super({
            x, y,
            texture: 'phoenixashes',
            tint: 0x603333,
            layer: Battle.Layers.onground,
            tags: [Tags.DELAY_RESOLVE(ballToRevive.team), Tags.FORCE_DELAY_RESOLVE],
        });

        let ashes = this;
        this.runScript(function*() {
            yield S.wait(3);
            yield S.doOverTime(1.5, t => {
                ashes.tint = Color.lerpColorByLch(0x603333, 0xFFFF00, t);
                ashes.offsetX = ashes.oscillateNSeconds(0.5*(1-t*t)) ? 1 : 0;
                if (ashes.everyNSeconds(0.08)) {
                    ashes.world.playSound('shaker', { humanized: false }).volume = t*t;
                }
            });
            yield S.doOverTime(0.5, t => {
                ashes.offsetX = ashes.oscillateNSeconds(0.03) ? 1 : 0;
                if (ashes.everyNSeconds(0.08)) {
                    ashes.world.playSound('shaker', { humanized: false });
                }
            });

            ashes.world.playSound('cloak', { humanized: false });
            let ball = ashes.world.addWorldObject(squadBallToWorldBall({
                x: ashes.x,
                y: ashes.y,
                properties: {
                    type: ballToRevive.properties.type,
                    damage: damage,
                    health: health,
                    equipment: ballToRevive.equipment ? ballToRevive.equipment.equipmentType : -1,
                    level: ballToRevive.level,
                    metadata: ballToRevive.properties.metadata,
                },
            }, undefined, -1, ballToRevive.team));
            ball.afterAddImmuneTime = 0.5;
            ball.timesKilledEnemy = ballToRevive.timesKilledEnemy;

            if (ball instanceof Balls.Phoenix) {
                ball.canExplode = false;
                ball.isResurrection = true;

                if (!ballToRevive.isResurrection && ball.shouldActivateAbilityTwice()) {
                    ball.canExplode = true;
                }

                if (ballToRevive.isResurrection && ball.equipment?.equipmentType === 34) {
                    ball.unequip();  // Lose the Green Cube after use
                }
            }

            ball.world.addWorldObject(new BurstPuffSystem({
                x: ball.x,
                y: ball.y,
                layer: Battle.Layers.fx,
                puffCount: Math.floor(10 * getParticleLevel()),
                puffConfigFactory: () => ({
                    maxLife: 0.7,
                    v: Random.inCircle(80),
                    color: 0xFF8F00,
                    finalColor: 0xFFFF00,
                    radius: 4,
                    finalRadius: 0,
                }),
            }));

            ashes.kill();
        });

        
    }
}