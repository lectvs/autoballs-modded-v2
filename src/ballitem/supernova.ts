namespace BallItems {
    export class Supernova extends BallItem {
        getName() { return 'Supernova'; }
        getDesc() { return `Convert [gold]1<star>[/gold] into either [g]+${this.buffAmount}<heart>[/g] or [r]+${this.buffAmount}<sword>[/r] (random)`; }
    
        get buffAmount() { return 3; }

        constructor(x: number, y: number) {
            super(x, y, 'items/supernova');
        }

        canApplyToBall(ball: Ball): boolean {
            return ball.level > 1;
        }
    
        onApplyToBall(ball: Ball): void {
            let randomBuff = Ball.Random.boolean() ? { dmg: this.buffAmount, hp: 0 } : { dmg: 0, hp: this.buffAmount };

            ball.runScript(function*() {
                ball.world.playSound('implode');
                let nova = ball.addChild(new Sprite({
                    texture: 'necromancerbeams',
                    copyFromParent: ['layer'],
                    scale: 0,
                    life: 1,
                    vangle: 180,
                    tags: [Tags.DELAY_PLAY],
                    update: function() {
                        World.Actions.orderWorldObjectAfter(this, ball.stars);
                    },
                }));

                yield S.doOverTime(1, t => nova.scale = M.jumpParabola(0.5, 1, 0, t) * (ball.physicalRadius + 4) / 64);

                ball.levelDown();
                let buff = ball.world.addWorldObject(new Buff(ball.x, ball.y - ball.physicalRadius - 2, ball, randomBuff, vec2(Random.sign() * 200, 0)));
                buff.addTag(Tags.DELAY_PLAY);
            });
        }
    }
}
