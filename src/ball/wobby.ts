namespace Balls {
    export class Wobby extends Ball {
        getName() { return 'Wobby'; }
        getDesc() { return `On level up, give [g]${Wobby.getBuffAmount(this)}<heart>[/g] to itself and allies`; }
        getShopDmg() { return 4; }
        getShopHp() { return 5; }

        static getBuffAmount(source: Ball) { return 1; }

        constructor(config: Ball.Config) {
            super(Wobby.getTextureForLevel(config.properties.level), 8, config);

            this.addAbility('onLevelUp', Wobby.onLevelUp);
            this.addAbility('onLevelDown', Wobby.onLevelDown, { canActivateTwice: false });
        }

        changeAnimations() {
            let baseTexture = Wobby.getTextureForLevel(this.level);
            this.changeBaseTextureAndRadius(baseTexture, 8);
        }

        static onLevelUp(source: Ball, world: World) {
            if (source instanceof Wobby) {
                source.changeAnimations();
            }

            if (source.world instanceof AlmanacMenu) return;

            let validBalls = getAllies(world, source).filter(ball => ball.isInShop == source.isInShop);

            for (let ball of validBalls) {
                world.addWorldObject(new Buff(source.x, source.y, ball, { dmg: 0, hp: Wobby.getBuffAmount(source) }));
            }
        }

        private static onLevelDown(source: Wobby, world: World) {
            source.changeAnimations();
        }

        private static getTextureForLevel(level: number) {
            return `balls/wobby${M.clamp(level, 1, 4)}`;
        }
    }
}