namespace Balls {
    export class BlackHole extends Ball {
        getName() { return 'Black Hole'; }
        getDesc() {
            if (this.level === 1) return `Pulls all nearby balls toward it`;
            if (this.level < 4) return `Pulls allies toward it with [lb]${this.allyEffectivenessPercent}%[/lb] force and enemies with [lb]${this.enemyEffectivenessPercent}%[/lb] force`;
            return `Pulls allies toward it with [lb]${this.allyEffectivenessPercent}%[/lb] force`;
        }
        getShopDmg() { return 1; }
        getShopHp() { return 8; }
        getCredits() { return [CreditsNames.EVERYONE]; }

        get allyEffectivenessPercent() { return 100 + 20*(this.level-1); }
        get allyEffectiveness() { return this.allyEffectivenessPercent/100; }
        get enemyEffectivenessPercent() {
            if (this.level === 1) return 100;
            if (this.level === 2) return 66;
            if (this.level === 3) return 33;
            return 0;
        }
        get enemyEffectiveness() { return this.enemyEffectivenessPercent/100; }

        private curl: Sprite;
        private overlay: Sprite;

        constructor(config: Ball.Config) {
            super('balls/blackhole', 8, config);

            this.curl = this.addChild(new Sprite({
                texture: 'blackholecurl',
                copyFromParent: ['layer'],
                angle: Random.angle(),
                effects: { pre: { filters: [ new BallTeamColorFilter(Ball.getTeamColor(this.team)), new Effects.Filters.Outline(0x000000, 1) ] } },
            }));

            this.overlay = this.addChild(new Sprite({
                texture: 'blackholeoverlay',
                copyFromParent: ['layer'],
            }));

            this.setMassScale(8);

            this.addAbility('update', BlackHole.update);
        }

        private static update(source: BlackHole, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let balls = world.select.typeAll(Ball).filter(ball => ball !== source
                                                                && G.distance(ball, source) < 75 && source.isBallAffected(ball));

            for (let ball of balls) {
                //if (G.distance(ball, source) < ball.physicalRadius + source.physicalRadius + 4) return;

                let effectiveness = ball.team === source.team
                        ? source.allyEffectiveness
                        : source.enemyEffectiveness;

                let pullForce = ball.team === source.team
                        ? 4000
                        : 8000;
                
                let magnitudeClamp = M.mapClamp(source.allyEffectiveness, 1, 2, 100, 2000);

                let pullPos = ball.team === source.team
                        ? source.getPosition().add(ball.getPosition().subtract(source).setMagnitude(ball.physicalRadius + source.physicalRadius + 8))
                        : source.getPosition();
                
                let force = PhysicsUtils.inverseLinear(pullPos.subtract(ball), pullForce * effectiveness).clampMagnitude(magnitudeClamp);
                ball.v.add(force.scale(source.delta));
            }
        }

        postUpdate() {
            super.postUpdate();
            this.curl.alpha = this.alpha;
            this.curl.scale = this.ballScale * this.moveScale;
            this.curl.vangle = this.state === Ball.States.BATTLE ? 120 : 45;
            World.Actions.orderWorldObjectBefore(this.curl, this);

            this.overlay.alpha = this.alpha;
            this.overlay.scale = this.ballScale * this.moveScale;
            World.Actions.orderWorldObjectAfter(this.overlay, this);
        }

        changeHighlight(enabled: boolean, color?: number, alpha?: number) {
            if (color === undefined) color = this.curl.effects.outline.color;
            if (alpha === undefined) alpha = this.curl.effects.outline.alpha;
            this.curl.effects.outline.enabled = enabled;
            this.curl.effects.outline.color = color;
            this.curl.effects.outline.alpha = alpha;
        }

        onCollide(collideWith: Physics.Collision) {
            super.onCollide(collideWith);
            if (collideWith.other.obj instanceof Ball && collideWith.other.obj.team !== this.team) {
                this.cooldownBall(collideWith.other.obj);
            }
        }

        private isBallAffected(ball: Ball) {
            return this.getBallTimer(ball).done;
        }

        private cooldownBall(ball: Ball) {
            this.getBallTimer(ball).reset();
        }

        private getBallTimer(ball: Ball) {
            if (!ball.data.blackHoleTimer) ball.data.blackHoleTimer = ball.addTimer(0.2);
            return ball.data.blackHoleTimer as Timer;
        }
    }
}
