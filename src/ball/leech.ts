namespace Balls {
    export class Leech extends Ball {
        getName() { return 'Leech'; }
        getDesc() { return `[r]-${this.leechRate}<heart>/s[/r] to enemies in its aura. Give ${this.healMult}x leeched damage to random allies as health buffs`; }
        getShopDmg() { return 1; }
        getShopHp() { return 5; }

        private aura: Sprite;

        get leechRate() { return 1; }
        get healMult() { return 1 + this.level/2; }
        get auraRadius() {
            if ((this.isInShop || this.isInYourSquadScene) && !this.isBeingMoved()) return 20;
            return this.physicalRadius-8 + 30 + 5*(this.level-1);
        }
        
        private get hpDisperseBatch() { return 1 / this.healMult; }

        private hpBank: number;

        constructor(config: Ball.Config) {
            super('balls/leech', 8, config);

            this.aura = this.addChild(new Sprite({
                texture: 'aura',
                tint: 0xFF0000,
                blendMode: Texture.BlendModes.ADD,
                copyFromParent: ['layer'],
                scale: this.auraRadius / 64,
            }));

            this.hpBank = 0;

            this.addAbility('update', Leech.update);
            this.addAbility('onDeath', Leech.onDeath);
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

        private static update(source: Leech, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let enemyBalls = getEnemies(world, source);

            for (let ball of enemyBalls) {
                if (G.distance(ball, source) < ball.radius + source.auraRadius) {
                    let hpToLeech = source.leechRate * source.delta;
                    let actualHpLeeched = ball.leechFor(hpToLeech, source);
                    source.hpBank += actualHpLeeched;
                    ball.addLeeched(0.1);
                }
            }

            Leech.disperseHp(source, world);
        }

        private static onDeath(source: Leech, world: World, killedBy: Ball) {
            Leech.disperseHp(source, world, 'onDeath');
        }

        private static disperseHp(source: Leech, world: World, onDeath?: 'onDeath') {
            while (source.hpBank >= source.hpDisperseBatch) {
                source.hpBank -= source.hpDisperseBatch;
                Leech.disperseSingle(source, world, source.hpDisperseBatch);
            }

            if (onDeath && source.hpBank > 0) {
                Leech.disperseSingle(source, world, source.hpBank);
            }
        }

        private static disperseSingle(source: Leech, world: World, amount: number) {
            let allyBalls = getAlliesNotSelf(world, source);
            let needyBalls = allyBalls.filter(ball => ball.hp < ball.maxhp);
            let targetBall = needyBalls.length > 0 ? Ball.Random.element(needyBalls) : Ball.Random.element(allyBalls);
            if (targetBall) {
                world.addWorldObject(new RandomBuff(source.x, source.y, source, targetBall, { dmg: 0, hp: amount * source.healMult }, allies => {
                    let needies = allies.filter(ball => ball.hp < ball.maxhp);
                    return needies.length > 0 ? Ball.Random.element(needies) : Ball.Random.element(allies);
                }));
            }
        }
    }
}