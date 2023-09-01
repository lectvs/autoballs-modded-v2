namespace Balls {
    export class Necromancer extends Ball {
        getName() { return 'Necromancer'; }
        getDesc() { return `When an ally dies, summon a ${buffText(this.skeletonDmg, this.skeletonHp)} skeleton (up to ${this.maxSkeletons} total)`; }
        getShopDmg() { return 1; }
        getShopHp() { return 6; }

        get skeletonDmg() { return this.level; }
        get skeletonHp() { return this.level; }

        get maxSkeletons() { return 5; }
        private skeletonsSummoned: number;

        constructor(config: Ball.Config) {
            super('balls/necromancer', 8, config);
            this.skeletonsSummoned = 0;

            this.addAbility('onBallDie', Necromancer.onBallDie);
        }

        private static onBallDie(source: Necromancer, world: World, ballThatDied: Ball): void {
            if (ballThatDied.team !== source.team) return;
            if (source.skeletonsSummoned >= source.maxSkeletons) return;
            
            let p = source.getPosition().add(Ball.Random.onCircle(16));

            let ball = world.addWorldObject(squadBallToWorldBall({
                x: p.x,
                y: p.y,
                properties: {
                    type: 16,
                    level: 1,
                    damage: source.skeletonDmg,
                    health: source.skeletonHp,
                    equipment: -1,
                    metadata: {},
                }
            }, undefined, -1, source.team));

            source.addChild(new Sprite({
                texture: 'necromancerbeams',
                copyFromParent: ['layer'],
                scale: (source.physicalRadius + 10) / 64,
                life: 0.7,
                vangle: 180,
                update: function() {
                    this.alpha = M.jumpParabola(0, 1, 0, this.life.progress);
                    World.Actions.orderWorldObjectBefore(this, this.parent);
                },
            }));

            world.addWorldObject(new BurstPuffSystem({
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

            source.skeletonsSummoned++;
        }
    }
}