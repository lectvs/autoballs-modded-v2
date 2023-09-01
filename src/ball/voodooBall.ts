namespace Balls {
    export class VoodooBall extends Ball {
        getName() { return 'Voodoo Ball'; }
        getDesc() { return `On death, reflect ${this.damagePercent}% of its killer's [r]<sword>[/r] back at it`; }
        getShopDmg() { return 4; }
        getShopHp() { return 4; }
        getCredits() { return [CreditsNames.MATERWELONS]; }

        get damagePercent() {
            return 10 + 10*this.level;
        }
        get damageFactor() { return this.damagePercent/100; }

        constructor(config: Ball.Config) {
            super('balls/voodooball', 8, config);

            this.addAbility('onDeath', VoodooBall.onDeath);
        }

        private static onDeath(source: VoodooBall, world: World, killedBy: Ball) {
            killedBy.takeDamage(killedBy.dmg * source.damageFactor, source, 'other');

            killedBy.runScript(function*() {
                yield S.doOverTime(0.5, t => {
                    killedBy.tint = Color.lerpColorByLch(0xB200B2, 0xFFFFFF, t);
                });
            });

            world.addWorldObject(new Voodoo(killedBy));
        }
    }
}