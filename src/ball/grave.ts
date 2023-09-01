namespace Balls {
    export class Grave extends Ball {
        getName() { return 'Grave'; }
        getDesc() { return `Summon two ${buffText(this.skeletonDmg, this.skeletonHp)} skeletons. Whenever one of these skeletons dies, summon another one`; }
        getShopDmg() { return 2; }
        getShopHp() { return 8; }
        getCredits() { return [CreditsNames.CONFLICTING_THEMES, CreditsNames.MATERWELONS]; }

        get skeletonDmg() { return this.level; }
        get skeletonHp() { return this.level; }

        private skeletons: Ball[];

        constructor(config: Ball.Config) {
            super('balls/grave', 8, config);

            this.skeletons = [];

            this.addAbility('update', Grave.update, { canActivateTwice: false });
        }

        private static update(source: Grave, world: World) {
            if (source.state !== Ball.States.BATTLE) return;

            A.filterInPlace(source.skeletons, s => s && s.world);
            if (_.size(source.skeletons) >= 2) return;

            Grave.summonSkeleton(source, world);
            if (source.shouldActivateAbilityTwice()) {
                Grave.summonSkeleton(source, world);
            }

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

            world.playSound('sellball');
        }

        private static summonSkeleton(source: Grave, world: World) {
            let d = Ball.Random.onCircle(16);
            let p = source.getPosition().add(d);

            let skeleton = world.addWorldObject(squadBallToWorldBall({
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

            skeleton.addChild(new Sprite({
                texture: 'aura',
                tint: 0x57007F,
                scale: 16/64,
                copyFromParent: ['layer'],
                postUpdate: function() {
                    World.Actions.orderWorldObjectBefore(this, skeleton);
                },
            }));

            skeleton.v.set(d.withMagnitude(100));

            source.skeletons.push(skeleton);

            world.addWorldObject(new BurstPuffSystem({
                x: skeleton.x,
                y: skeleton.y,
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
        }
    }
}