namespace Balls {
    export class Buffer extends Ball {
        getName() { return 'Buffer'; }
        getDesc() { return `On enter battle, give the closest ally [r]+${this.buffAmount}<sword>[/r]`; }
        getShopDmg() { return 2; }
        getShopHp() { return 5; }

        get buffAmount() { return 2*this.level; }

        constructor(config: Ball.Config) {
            super('balls/buffer', 8, config);

            this.addAbility('onPreBattle', Buffer.onPreBattle);
            this.addAbility('onEnterBattle', Buffer.onEnterBattle);
        }

        private static onPreBattle(source: Buffer, world: World) {
            Buffer.giveBuff(source, world);
        }

        private static onEnterBattle(source: Buffer, world: World) {
            if (source.hasActivatedAbility('onPreBattle')) return;
            Buffer.giveBuff(source, world);
        }

        private static giveBuff(source: Buffer, world: World) {
            let validBalls = getAlliesNotSelf(world, source);
            if (validBalls.length === 0) return;

            let closestBall = M.argmin(validBalls, ball => G.distance(source, ball));
            let buff = world.addWorldObject(new Buff(source.x, source.y, closestBall, { dmg: source.buffAmount, hp: 0 }));

            source.setPreBattleAbilityActiveCheck(() => buff.world);
        }
    }
}