namespace Balls {
    export class Haunt extends Ball {
        getName() { return 'Haunt'; }
        getDesc() { return `On death, haunts the enemy that killed it, dealing [r]${this.ghostDmg}<sword>/s[/r] for the rest of the battle`; }
        getShopDmg() { return 4; }
        getShopHp() { return 5; }
        getCredits() { return [CreditsNames.CONFLICTING_THEMES, CreditsNames.MATERWELONS]; }

        get ghostDmg() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/haunt', 8, config);

            this.addAbility('onDeath', Haunt.onDeath, { canActivateTwice: false });
        }

        private static onDeath(source: Haunt, world: World, killedBy: Ball) {
            if (!killedBy || killedBy.team === source.team) return;

            let ghost = world.addWorldObject(new Ghost(source.x, source.y, source, killedBy, source.ghostDmg));
            if (source.shouldActivateAbilityTwice()) {
                let p = Ball.Random.onCircle(5);
                ghost.doAfterTime(0.1, () => world.addWorldObject(new Ghost(source.x + p.x, source.y + p.y, source, killedBy, source.ghostDmg)));
            }

            world.playSound('spook');
        }
    }
}