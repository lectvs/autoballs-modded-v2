namespace Balls {
    export class Vampire extends Ball {
        getName() { return 'Vampire'; }
        getDesc() { return `Drain [g]${this.drainRate}<heart>/s TOTAL[/g] from nearby allies, absorbing [lb]${this.absorbMult}x[/lb] as health\n\nCannot drain from other Vampires`; }
        getShopDmg() { return 5; }
        getShopHp() { return 2; }

        get drainRate() { return 3 + 1*(this.level-1); }
        get drainRadius() { return 24; }
        get absorbMult() { return 1.25 + 0.25*(this.level-1); }

        private vampRing: VampRing;

        constructor(config: Ball.Config) {
            super('balls/vampire', 8, config);

            this.vampRing = this.addChild(new VampRing(0, 0));
            this.vampRing.copyFromParent.push('layer');

            this.addAbility('update', Vampire.update);
        }

        postUpdate() {
            super.postUpdate();

            this.vampRing.setVisible(!this.isInShop && !this.isInYourSquadScene);
            World.Actions.orderWorldObjectBefore(this.vampRing, this);
        }

        setForInShop(): void {
            this.vampRing.setVisible(false);
        }

        private static update(source: Vampire, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let allyBalls = getAlliesNotSelf(world, source).filter(ball => !(ball instanceof Vampire) && G.distance(ball, source) < ball.physicalRadius + source.drainRadius);
            if (allyBalls.length === 0) return;

            let drainRateForEachBall = source.drainRate / allyBalls.length;

            let totalHpDrained = 0;

            for (let ball of allyBalls) {
                let hpToDrain = drainRateForEachBall * source.delta;
                let actualHpDrained = ball.leechFor(hpToDrain, source);
                ball.addLeeched(0.1);

                if (ball.dead) {
                    world.addWorldObject(new Explosion(ball.x, ball.y, 10, { ally: 0, enemy: 0 }));
                    world.runScript(shake(world, 1, 0.1));
                }

                totalHpDrained += actualHpDrained;
            }

            let healedHp = totalHpDrained * source.absorbMult;
            source.maxhp += healedHp;
            source.hp += healedHp;
            source.showHpStat(healedHp, 0.5);
        }
    }
}