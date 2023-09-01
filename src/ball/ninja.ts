namespace Balls {
    export class Ninja extends Ball {
        getName() { return 'Ninja'; }
        getDesc() { return `On enter battle, shoot [lb]${this.spikes}[/lb] [r]${this.spikeDamage}<sword>[/r] homing spikes at the enemy with the lowest [g]<heart>[/g]\n\nCannot target Grenades`; }
        getShopDmg() { return 4; }
        getShopHp() { return 2; }
        getCredits() { return [CreditsNames.BALLAM]; }

        get spikes() { return 2*this.level; }
        get spikeDamage() { return 1; }

        constructor(config: Ball.Config) {
            super('balls/ninja', 8, config);

            this.addAbility('onPreBattle', Ninja.onPreBattle);
            this.addAbility('onEnterBattle', Ninja.onEnterBattle);
        }

        private static onPreBattle(source: Ninja, world: World) {
            Ninja.shootSpikes(source, world);
        }

        private static onEnterBattle(source: Ninja, world: World) {
            if (source.hasActivatedAbility('onPreBattle')) return;
            Ninja.shootSpikes(source, world);
        }

        private static shootSpikes(source: Ninja, world: World) {
            let validBalls = getEnemies(world, source).filter(ball => !(ball instanceof Grenade));
            if (validBalls.length === 0) return;

            let spikeCounts = M.batch(source.spikes, 20);

            let weakestBall = M.argmin(validBalls, ball => ball.hp);
            let spikes: HomingSpike[] = [];
            for (let count of spikeCounts) {
                let spike = world.addWorldObject(new HomingSpike(source.x, source.y, source, weakestBall, source.spikeDamage, count, enemyBalls => undefined));
                spikes.push(spike);
                source.didShootProjectile(count);
            }

            source.setPreBattleAbilityActiveCheck(() => spikes.some(spike => spike.world));
        }
    }
}