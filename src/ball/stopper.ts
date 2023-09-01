namespace Balls {
    export class Stopper extends Ball {
        getName() { return 'Stopper'; }
        getDesc() { return `On collide with enemy, stop enemies in a radius for 1s`; }
        getShopDmg() { return 3; }
        getShopHp() { return 5; }
        getCredits() { return [CreditsNames.C_RRY]; }

        get stopRadius() { return this.physicalRadius-8 + 100*Math.exp(0.25*this.level)/(Math.exp(0.25*this.level) + 3); }

        private cooldown: Timer;
        private visibleStopRadius: number;

        constructor(config: Ball.Config) {
            super('balls/stopper', 8, config);
            this.visibleStopRadius = this.stopRadius;

            this.cooldown = this.addTimer(0.1);
            this.cooldown.finish();

            this.addAbility('onCollideWithEnemyPostDamage', Stopper.onCollideWithEnemyPostDamage, { canActivateTwice: false });
        }

        postUpdate() {
            super.postUpdate();
            if ((this.isInShop && !this.isBeingMoved()) || this.isInYourSquadScene || this.isNullified()) {
                this.visibleStopRadius = 0;
            } else {
                this.visibleStopRadius = M.lerpTime(this.visibleStopRadius, this.stopRadius, 100, this.delta);
            }
        }

        render(texture: Texture, x: number, y: number) {
            Draw.brush.color = 0xFF0000;
            Draw.brush.alpha = 0.7;
            Draw.brush.thickness = 1;

            let vertices = G.generatePolygonVertices(x, y, this.visibleStopRadius+1, 8);
            Draw.polygonOutline(texture, vertices);

            super.render(texture, x, y);
        }

        private static onCollideWithEnemyPostDamage(source: Stopper, world: World, collideWith: Ball, damage: number) {
            if (!source.cooldown.done) return;

            Stopper.stopEnemies(source, world);
            if (source.shouldActivateAbilityTwice()) {
                source.doAfterTime(0.3, () => Stopper.stopEnemies(source, world));
            }
            
            source.cooldown.reset();
        }

        private static stopEnemies(source: Stopper, world: World) {
            let validEnemies = getEnemies(world, source)
                .filter(enemy => G.distance(enemy, source) <= source.stopRadius + enemy.physicalRadius);

            for (let enemy of validEnemies) {
                enemy.stop(1);
            }

            world.playSound('stopboom', { limit: 4 });
            if (source.hp > 0) {
                source.addChild(new Stop(0, 0, source.visibleStopRadius+1, source));
            } else {
                world.addWorldObject(new Stop(source.x, source.y, source.visibleStopRadius+1, source));
            }
        }
    }
}