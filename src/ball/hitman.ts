namespace Balls {
    export class Hitman extends Ball {
        getName() { return 'Hitman'; }
        getDesc() { return `On enter battle, sacrifice [r]half of its <sword>[/r] to shoot a homing spike at the farthest enemy for [r]${this.spikeDamageMultiplier}x the sacrificed <sword>[/r]`; }
        getShopDmg() { return 4; }
        getShopHp() { return 4; }
        getCredits() { return [CreditsNames.XIAOSLOTH, CreditsNames.JUNJ]; }

        get spikeDamageMultiplier() { return 1 + 0.5*(this.level-1); }

        constructor(config: Ball.Config) {
            super('balls/hitman', 8, config);

            this.addAbility('onPreBattle', Hitman.onPreBattle, { canActivateTwice: false });
            this.addAbility('onEnterBattle', Hitman.onEnterBattle, { canActivateTwice: false });
        }

        private static onPreBattle(source: Hitman, world: World) {
            Hitman.selectTargetAndShootSpike(source, world);
        }

        private static onEnterBattle(source: Hitman, world: World) {
            if (source.hasActivatedAbility('onPreBattle')) return;
            Hitman.selectTargetAndShootSpike(source, world);
        }

        private static selectTargetAndShootSpike(source: Hitman, world: World) {
            let validBalls = getEnemies(world, source);
            if (validBalls.length === 0) return;

            let farthestBall = M.argmax(validBalls, ball => G.distance(ball, source));
            Hitman.shootSpike(source, world, farthestBall);
            if (source.shouldActivateAbilityTwice()) {
                Hitman.shootSpike(source, world, farthestBall);
            }

            source.dmg /= 2;
            source.showDmgStat(-1, 1);
        }

        private static shootSpike(source: Hitman, world: World, target: Ball) {
            let spike = world.addWorldObject(new HomingSpike(source.x, source.y, source, target, source.dmg/2 * source.spikeDamageMultiplier, 1, enemyBalls => undefined));
            source.didShootProjectile(1);

            source.setPreBattleAbilityActiveCheck(() => spike.world);
        }
    }
}