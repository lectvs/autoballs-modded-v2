namespace Balls {
    export class Cheel extends Ball {
        getName() { return 'Cheel'; }
        getDesc() { return `Reduce nearby enemies' damage by [r]${this.cheelRate}<sword>/s[/r]. Give ${this.dmgMult}x stolen damage to random allies as damage buffs`; }
        getShopDmg() { return 1; }
        getShopHp() { return 5; }
        getCredits() { return [CreditsNames.TOMMYDOG145]; }

        private aura: Sprite;

        get cheelRate() { return 1; }
        get dmgMult() { return 0.5 + this.level*0.5; }
        get auraRadius() { return ((this.isInShop || this.isInYourSquadScene) && !this.isBeingMoved()) ? 20 : this.physicalRadius-8 + 30 + 5*(this.level-1); }
        
        private get dmgDisperseBatch() { return 1 / this.dmgMult; }
        private dmgBank: number;

        constructor(config: Ball.Config) {
            super('balls/cheel', 8, config);

            this.aura = this.addChild(new Sprite({
                texture: 'aura',
                tint: 0xFF0000,
                blendMode: Texture.BlendModes.ADD,
                copyFromParent: ['layer'],
                scale: this.auraRadius / 64,
            }));

            this.dmgBank = 0;

            this.addAbility('update', Cheel.update);
            this.addAbility('onDeath', Cheel.onDeath);
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

        private static update(source: Cheel, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let enemyBalls = getEnemies(world, source);

            for (let ball of enemyBalls) {
                if (G.distance(ball, source) < ball.radius + source.auraRadius) {
                    let cheeledDmg = source.cheelRate * source.delta;
                    if (ball.dmg <= 0) {
                        ball.showDmgStat(-cheeledDmg, 0.5);
                        continue;
                    }
                    ball.cheelFor(cheeledDmg);
                    source.dmgBank += cheeledDmg;
                    ball.addLeeched(0.1);
                }
            }

            Cheel.disperseDmg(source, world);
        }

        private static onDeath(source: Cheel, world: World) {
            Cheel.disperseDmg(source, world, 'onDeath');
        }

        private static disperseDmg(source: Cheel, world: World, onDeath?: 'onDeath') {
            while (source.dmgBank >= source.dmgDisperseBatch) {
                source.dmgBank -= source.dmgDisperseBatch;
                Cheel.disperseSingle(source, world, source.dmgDisperseBatch);
            }

            if (onDeath && source.dmgBank > 0) {
                Cheel.disperseSingle(source, world, source.dmgBank);
            }
        }

        private static disperseSingle(source: Cheel, world: World, amount: number) {
            let allyBalls = getAlliesNotSelf(world, source);
            let targetBall = Ball.Random.element(allyBalls);
            if (targetBall) {
                world.addWorldObject(new RandomBuff(source.x, source.y, source, targetBall, { dmg: amount * source.dmgMult, hp: 0 }, allies => Ball.Random.element(allies)));
            }
        }
    }
}