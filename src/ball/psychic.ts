namespace Balls {
    export class Psychic extends Ball {
        getName() { return 'Psychic'; }
        getDesc() {
            let amount = this.maxHits === 1 ? 'once' : (this.maxHits === 2 ? 'twice' : `${this.maxHits} times`);
            return `Lock the enemy with the highest [r]<sword>[/r] in place until it is hit [lb]${amount}[/lb]\n\nThe locked enemy takes half damage, but deals none`;
        }
        getShopDmg() { return 2; }
        getShopHp() { return 5; }

        get maxHits() { return this.level; }

        target: Ball;
        private startTimesHit: number;

        private lastTargeting: boolean;
        private timesAbilityActivated: number;

        private eye: Sprite;
        private aura: Sprite;

        private wub: Sound;

        constructor(config: Ball.Config) {
            super('balls/psychic', 8, config);

            this.eye = this.addChild(new Sprite({
                animations: [ Animations.fromTextureList({ name: 'glow', textureRoot: 'psychiceye', textures: [0, 1], frameRate: 16, count: Infinity }) ],
                defaultAnimation: 'glow',
                tint: 0xFF44FF,
                alpha: 0.6,
                copyFromParent: ['layer'],
                visible: false,
            }));

            this.aura = this.addChild(new Sprite({
                texture: 'aura',
                tint: 0xFF44FF,
                alpha: 0.5,
                blendMode: Texture.BlendModes.ADD,
                copyFromParent: ['layer'],
                visible: false,
            }));

            this.wub = new Sound('wub');
            this.wub.loop = true;
            this.wub.volume = 0;

            this.lastTargeting = false;
            this.timesAbilityActivated = 0;

            this.preBattleAbilityInitialWaitTime = 0.5;

            this.addAbility('onPreBattle', Psychic.onPreBattle, { canActivateTwice: false });
            this.addAbility('onEnterBattle', Psychic.onEnterBattle, { canActivateTwice: false });
        }

        onAdd(): void {
            super.onAdd();
            this.wub.controller = this.world.soundManager;
        }

        postUpdate(): void {
            super.postUpdate();
            World.Actions.orderWorldObjectAfter(this.eye, this);
            World.Actions.orderWorldObjectAfter(this.aura, this);

            if (this.isTargeting()) {
                this.setTexture(this.animationManager.animations['prep'][0].texture);
                this.angle = 0;
            }
        }

        updateBattle(): void {
            super.updateBattle();

            if (this.isTargeting()) {
                this.target.addStun('psychic', 0.1);
                this.eye.setVisible(true);
                this.aura.setVisible(true);

                this.aura.scale = M.lerp(12, 14, M.mod(Math.floor(this.life.time * 16), 2)) / 64;

                this.wub.volume = M.lerpTime(this.wub.volume, 1, 5, this.delta);
            } else {
                this.eye.setVisible(false);
                this.aura.setVisible(false);

                this.wub.volume = M.lerpTime(this.wub.volume, 0, 5, this.delta);

                if (this.lastTargeting && this.timesAbilityActivated === 1 && this.shouldActivateAbilityTwice()) {
                    this.doAfterTime(0.5, () => Psychic.startPsychicing(this, this.world));
                }
            }

            this.wub.update(this.delta);

            this.lastTargeting = this.isTargeting();
        }

        private isTargeting() {
            let totalMaxHits = this.world.select.typeAll(Balls.Psychic).filter(ball => ball.team === this.team).map(ball => ball.maxHits).reduce((a,b) => a + b);
            return this.target && this.target.world && this.target.timesTakenDamage - this.startTimesHit < totalMaxHits;
        }

        private static onPreBattle(source: Psychic, world: World) {
            Psychic.startPsychicing(source, world);
        }

        private static onEnterBattle(source: Psychic, world: World) {
            if (source.hasActivatedAbility('onPreBattle')) return;
            Psychic.startPsychicing(source, world);
        }

        private static startPsychicing(source: Psychic, world: World) {
            source.timesAbilityActivated++;
            source.runScript(S.chain(
                S.yield(),
                S.call(() => {
                    let validEnemies = getEnemies(world, source);
                    if (validEnemies.length === 0) return;
        
                    source.target = M.argmax(validEnemies, ball => ball.dmg);
                    source.startTimesHit = source.target.timesTakenDamage;
                })
            ));
        }
    }
}