namespace Balls {
    export class BallOfIce extends Ball {
        getName() { return 'Ball of Ice'; }
        getDesc() {
            return `On PLAY, convert [gold]1<star>[/gold] to give a random frozen shop ball +${buffText(BallOfIce.getBuffAmount(this), BallOfIce.getBuffAmount(this))}\n\nTwo Balls of Ice cannot buff the same ball`;
        }
        getShopDmg() { return 2; }
        getShopHp() { return 4; }
        getCredits() { return [CreditsNames.JUNJ]; }

        static getBuffAmount(source: Ball) { return source.level; }

        constructor(config: Ball.Config) {
            super('balls/ballofice', 8, config);

            this.addAbility('onPlay', BallOfIce.onPlay);
        }

        static onPlay(source: Ball, world: World): void {
            if (source.level <= 1) return;

            let existingBuffs = world.select.typeAll(Buff).filter(buff => buff.hasTag(Tags.BALL_OF_ICE_BUFF));

            let validBalls = getAlliesNotSelf(world, source).filter(ball => ball.isInShop && ball.frozen && !existingBuffs.some(buff => buff.target === ball));
            if (validBalls.length === 0) return;

            let randomBall = Ball.Random.element(validBalls);
            let buff = world.addWorldObject(new Buff(source.x, source.y, randomBall, { dmg: BallOfIce.getBuffAmount(source), hp: BallOfIce.getBuffAmount(source) }));
            buff.addTag(Tags.BALL_OF_ICE_BUFF);

            source.levelDown();

            world.playSound('sellball', { humanized: false, volume: 1.5 });

            FIND_OPPONENT_WAIT_TIME = Math.max(FIND_OPPONENT_WAIT_TIME, 2);
        }
    }
}