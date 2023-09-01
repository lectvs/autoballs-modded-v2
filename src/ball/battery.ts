namespace Balls {
    export class Battery extends Ball {
        getName() { return 'Battery'; }
        getDesc() {
            let PLAY = `${GAME_MODE === 'vs' ? 'LOCK IN' : 'PLAY'}`;
            return `On ${PLAY}, convert [gold]1<star>[/gold] into ${buffText(Battery.getBuffAmount(this), Battery.getBuffAmount(this))} buffs for ${Battery.getAlliesToBuff(this)} random allies`;
        }
        getShopDmg() { return 4; }
        getShopHp() { return 4; }

        static getBuffAmount(source: Ball) { return 1; }
        static getAlliesToBuff(source: Ball) { return 2; }

        constructor(config: Ball.Config) {
            super('balls/battery', 8, config);

            this.addAbility('onPlay', Battery.onPlay);
        }

        static onPlay(source: Ball, world: World) {
            if (source.level <= 1) return;

            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.isInShop);
            if (validBalls.length === 0) return;

            if (validBalls.length > Battery.getAlliesToBuff(source)) {
                Ball.Random.shuffle(validBalls);
                validBalls = validBalls.slice(0, Battery.getAlliesToBuff(source));
            }

            for (let ally of validBalls) {
                world.addWorldObject(new RandomBuff(source.x, source.y, source, ally, { dmg: Battery.getBuffAmount(source), hp: Battery.getBuffAmount(source) }, _ => undefined));
            }
            
            source.levelDown();

            world.playSound('sellball', { humanized: false, volume: 1.5 });

            FIND_OPPONENT_WAIT_TIME = Math.max(FIND_OPPONENT_WAIT_TIME, 2);
        }
    }
}