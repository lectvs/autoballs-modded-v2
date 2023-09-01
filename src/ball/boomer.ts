namespace Balls {
    export class Boomer extends Ball {
        getName() { return 'Boomer'; }
        getDesc() { return `Fires explosive mortars at random enemies for [r]${this.explosionDmg}<sword>/2s[/r]`; }
        getShopDmg() { return 2; }
        getShopHp() { return 5; }
        getCredits() { return [CreditsNames.JUNJ, CreditsNames.CONFLICTING_THEMES]; }

        get explosionRadius() { return 50*Math.exp(0.25*this.level)/(Math.exp(0.25*this.level) + 1); }
        get explosionDmg() { return 1 + 0.5 * (this.level-1); }

        private gun: Sprite;
        private shootTime: number;

        constructor(config: Ball.Config) {
            super('balls/turret', 8, config);

            this.gun = this.addChild(new Sprite({
                animations: [
                    Animations.fromSingleTexture({ name: 'idle', texture: 'boomergun/0' }),
                    Animations.fromTextureList({ name: 'shoot', textureRoot: 'boomergun', textures: [1, 2, 0], frameRate: 6, nextFrameRef: 'idle/0' }),
                ],
                copyFromParent: ['layer'],
            }));

            this.shootTime = Ball.Random.float(1.5, 2);

            this.addAbility('update', Boomer.update, { canActivateTwice: false });
        }

        postUpdate() {
            super.postUpdate();
            this.gun.alpha = this.alpha;
            this.gun.scale = this.ballScale * this.moveScale;
            World.Actions.orderWorldObjectAfter(this.gun, this);
        }

        private static update(source: Boomer, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            source.shootTime += source.delta;

            while (source.shootTime >= 2) {
                Boomer.shoot(source, world);
                if (source.shouldActivateAbilityTwice()) {
                    source.doAfterTime(0.2, () => Boomer.shoot(source, world));
                }
                source.shootTime -= 2;
            }
        }

        private static shoot(source: Boomer, world: World) {
            let enemyBalls = getEnemies(world, source);
            if (enemyBalls.length === 0) return;

            let target = Ball.Random.element(enemyBalls);
            world.addWorldObject(new BoomerMortar(target.x, target.y, source.x, source.y, source.explosionRadius, source.explosionDmg, source));
            world.playSound('shoot', { humanized: false }).speed = Random.float(0.75, 0.95);
            source.gun.playAnimation('shoot');
            source.didShootProjectile(1);
        }
    }
}