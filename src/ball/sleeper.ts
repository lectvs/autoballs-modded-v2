namespace Balls {
    export class Sleeper extends Ball {
        getName() { return 'Sleeper'; }
        getDesc() { return `Stops regularly to heal itself for [g]${this.healSelfRate}<heart>/s[/g] and nearby allies for [g]${this.healAllyRate}<heart>/s[/g]`; }
        getShopDmg() { return 1; }
        getShopHp() { return 6; }
        getCredits() { return [CreditsNames.JUNJ]; }

        get rollTime() { return 5; }
        get healTime() { return 3; }
        get healSelfRate() { return this.level/4; }
        get healAllyRate() { return this.level; }

        get healRadius() { return this.physicalRadius-8 + 48 + 12*(this.level-1); }
        get visibleHealRadius() {
            if (this.isInShop || this.isInYourSquadScene) return 0;
            if (this.behaviorSm.getCurrentStateName() === 'heal') return this.healRadius;
            return 0;
        }

        private aura: Sprite;
        private behaviorSm: StateMachine;

        constructor(config: Ball.Config) {
            super('balls/sleeper', 8, config);

            this.behaviorSm = new StateMachine();
            this.behaviorSm.addState('roll', {
                script: S.wait(() => this.rollTime),
                update: () => this.updateRoll(),
                transitions: [{ toState: 'slowing', condition: () => !this.isNullified() }],
            });
            this.behaviorSm.addState('slowing', {
                script: S.doOverTime(0.75, t => this.addSlow('other', M.lerp(0, 1, t), 0.1)),
                transitions: [{ toState: 'heal' }],
            });
            this.behaviorSm.addState('heal', {
                script: S.wait(() => this.getHealTime()),
                update: () => this.updateHeal(),
                transitions: [{ toState: 'roll' }],
            });

            this.aura = this.addChild(new Sprite({
                texture: 'aura',
                tint: 0x00FF00,
                blendMode: Texture.BlendModes.ADD,
                scale: this.visibleHealRadius / 64,
                copyFromParent: ['layer'],
            }));

            this.addAbility('update', Sleeper.update, { canActivateTwice: false, nullifyable: false });
        }

        private static update(source: Sleeper, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            source.behaviorSm.update(source.delta);
        }

        onStateChangeBattle() {
            this.behaviorSm.setState('heal');
        }

        updateRoll() {

        }

        updateHeal() {
            if (this.isNullified()) {
                this.behaviorSm.setState('roll');
                return;
            }

            this.addStun('other', 0.1);

            let allies = this.world.select.typeAll(Ball).filter(ball => ball.team === this.team && G.distance(ball, this) < ball.radius + this.healRadius);
            for (let ally of allies) {
                let healRate = ally === this ? this.healSelfRate : this.healAllyRate;
                ally.healFor(healRate * this.delta, this);
            }
        }

        postUpdate() {
            super.postUpdate();

            this.aura.alpha = M.lerp(0.8, 1.0, (Math.sin(4*this.aura.life.time) + 1)/2);
            this.aura.scale = M.lerpTime(this.aura.scale, this.visibleHealRadius / 64, 10, this.delta);
            World.Actions.orderWorldObjectBefore(this.aura, this);
        }
        
        setForInShop(): void {
            this.aura.scale = this.visibleHealRadius / 64;
        }

        private getHealTime() {
            if (this.shouldActivateAbilityTwice()) {
                return this.healTime*2;
            }
            return this.healTime;
        }
    }
}