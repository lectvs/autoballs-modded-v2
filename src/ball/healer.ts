namespace Balls {
    export class Healer extends Ball {
        getName() { return 'Healer'; }
        getDesc() { return `Allies heal [g]${this.healRate}<heart>/s[/g] within its aura during battle`; }
        getShopDmg() { return 1; }
        getShopHp() { return 3; }

        private aura: Sprite;

        get healRate() { return 1 + this.level * 0.5; }
        get auraRadius() {
            if ((this.isInShop || this.isInYourSquadScene) && !this.isBeingMoved()) return 20;
            return this.physicalRadius-8 + 28 * (1 + (this.level-1)*0.3);
        }

        constructor(config: Ball.Config) {
            super('balls/healer', 8, config);

            this.aura = this.addChild(new Sprite({
                texture: 'aura',
                tint: 0x00FF00,
                blendMode: Texture.BlendModes.ADD,
                scale: this.auraRadius / 64,
                copyFromParent: ['layer'],
            }));

            this.addAbility('update', Healer.update);
        }

        postUpdate() {
            super.postUpdate();

            this.aura.alpha = M.lerp(0.8, 1.0, (Math.sin(4*this.aura.life.time) + 1)/2);
            this.aura.scale = M.lerpTime(this.aura.scale, this.auraRadius / 64, 100, this.delta);
            World.Actions.orderWorldObjectBefore(this.aura, this);
        }

        setForInShop(): void {
            this.aura.scale = this.auraRadius / 64;
        }

        private static update(source: Healer, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let validBalls = getAlliesNotSelf(world, source).filter(ball => G.distance(ball, source) < ball.radius + source.auraRadius);

            for (let ball of validBalls) {
                ball.healFor(source.healRate * source.delta, source);
            }
        }
    }
}