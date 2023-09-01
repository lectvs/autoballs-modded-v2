namespace Balls {
    export class BioGrenade extends Ball {
        getName() { return 'Bio-Grenade'; }
        getDesc() { return `On death, plant [dg]spore equipments[/dg] on enemies in a radius\n\nSpored balls take [r]1<sword>[/r] extra per hit`; }
        getShopDmg() { return 6; }
        getShopHp() { return 1; }

        get explosionRadius() { return this.physicalRadius-8 + 36 * (1 + (this.level-1)*0.2); }
        get yourSquadRadius() { return 15; }

        private handle: Sprite;
        private visibleExplosionRadius: number;
        private aura: Sprite;

        constructor(config: Ball.Config) {
            super('balls/biogrenade', 4, config);
            this.angle = 90;
            this.visibleExplosionRadius = this.explosionRadius;

            this.handle = this.addChild(new Sprite({
                texture: 'biogrenadehandle',
                copyFromParent: ['layer'],
            }));

            this.aura = this.addChild(new Sprite({
                texture: 'aura',
                tint: 0x00FF00,
                blendMode: Texture.BlendModes.ADD,
                scale: 8 / 64,
                copyFromParent: ['layer'],
            }));

            this.addAbility('onDeath', onDeath);
        }

        postUpdate() {
            super.postUpdate();

            this.aura.alpha = M.lerp(0.8, 1.0, (Math.sin(4*this.aura.life.time) + 1)/2);
            World.Actions.orderWorldObjectBefore(this.aura, this);

            this.handle.alpha = this.alpha;
            this.handle.scale = this.ballScale * this.moveScale;
            this.handle.angle = this.angle - 90;
            this.handle.effects.outline.color = this.effects.outline.color;
            this.handle.effects.outline.enabled = this.effects.outline.enabled;
            World.Actions.orderWorldObjectBefore(this.handle, this);

            if ((this.isInShop && !this.isBeingMoved()) || this.isNullified()) {
                this.visibleExplosionRadius = 0;
            } else {
                 this.visibleExplosionRadius = M.lerpTime(this.visibleExplosionRadius, this.explosionRadius, 100, this.delta);
            }
        }

        setForInShop(): void {
            this.visibleExplosionRadius = 0;
        }

        render(texture: Texture, x: number, y: number) {
            let drawRadius = this.isInYourSquadScene ? this.yourSquadRadius : this.visibleExplosionRadius;
            Draw.brush.color = Color.lerpColorByLch(0x66DF66, 0x66FF66, Tween.Easing.OscillateSine(2)(this.life.time));
            Draw.brush.alpha = 0.6;
            Draw.brush.thickness = 1;
            Draw.circleOutline(texture, x, y, drawRadius, Draw.ALIGNMENT_INNER);

            super.render(texture, x, y);
        }
    }

    function onDeath(source: BioGrenade, world: World) {
        for (let i = 0; i < 5; i++) {
            let pos = Random.inCircle(source.explosionRadius-18).add(source.x, source.y);
            let smoke = world.addWorldObject(new Sprite({
                x: pos.x, y: pos.y,
                texture: lazy('bioGrenadeSmoke', () => new AnchoredTexture(Texture.filledCircle(24, 0x009F0F, 0.7), 0.5, 0.5)),
                layer: Battle.Layers.fx,
                scale: 0,
            }));
            world.runScript(function*() {
                yield S.wait(Random.float(0, 0.1));
                yield S.tween(0.1, smoke, 'scale', 0, Random.float(0.66, 1), Tween.Easing.OutCubic);
                yield S.tween(0.9, smoke, 'alpha', 1, 0, Tween.Easing.InQuad);
                smoke.kill();
            });
        }

        world.runScript(S.chain(
            S.wait(0.05),
            S.doOverTime(0.9, t => {
                let balls = getEnemies(world, source);
                for (let ball of balls) {
                    if (G.distance(source, ball) > source.explosionRadius + ball.physicalRadius) continue;
                    if (ball.equipment && ball.equipment.equipmentType === 14) continue;
                    ball.equip(14);
                    world.playSound('steal', { limit: 2 });
                }
            }),
        ));
    }
}