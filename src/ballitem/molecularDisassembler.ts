namespace BallItems {
    export class MolecularDisassembler extends BallItem {
        getName() { return 'Molecular Disassembler'; }
        getDesc() { return `Disintegrate a ball, producing [g]4<heart>[/g] for random allies\n\nProduce an extra [r]1<sword>[/r] if the ball had an equipment`; }
        getCredits() { return [CreditsNames.JUNJ]; }
    
        defaultOutlineAlpha: number = 0;

        get hpGain() { return 4; }
        get dmgBonusGain() { return 1; }

        constructor(x: number, y: number) {
            super(x, y, 'items/moleculardisassembler');
        }

        canApplyToBall(ball: Ball): boolean {
            return !ball.isInShop;
        }

        onApplyToBall(ball: Ball): void {
            let filter = new DisintegrateFilter();
            ball.effects.post.filters.push(filter);

            ball.addTag(Tags.DELAY_PLAY);

            let md = this;
            ball.isBeingDisintegrated = true;
            ball.runScript(function*() {

                ball.world.playSound('disintegrate');

                yield S.wait(1);

                yield S.schedule(
                    0, S.tween(2, filter, 'amount', 0, 0.7),
                    0.5, S.call(() => md.giveBuff(ball, 0, 1)),
                    0.75, S.call(() => md.giveBuff(ball, 0, 1)),
                    1, S.call(() => md.giveBuff(ball, 0, 1)),
                    1.25, S.call(() => md.giveBuff(ball, 0, 1)),
                );

                yield S.wait(0.5);

                ball.world.playSound('dioboom');
                let nova = ball.world.addWorldObject(new Sprite({
                    x: ball.x, y: ball.y,
                    texture: 'necromancerbeams',
                    scale: 0,
                    life: 1,
                    vangle: 360,
                    tags: [Tags.DELAY_PLAY],
                    layer: Battle.Layers.fx,
                }));

                yield S.tween(0.05, nova, 'scale', 0, (ball.physicalRadius + 8) / 64);

                if (ball.equipment) md.giveBuff(ball, 1, 0);

                ShopActions.removeBallFromSquad(ball);
                ball.kill();

                nova.runScript(function*() {
                    yield S.tween(0.2, nova, 'scale', nova.scale, 0);
                });
            });
        }

        private giveBuff(source: Ball, dmg: number, hp: number) {
            let validAllies = getAlliesNotSelf(source.world, source).filter(ally => !ally.isInShop);
            if (validAllies.length === 0) return;

            let randomAlly = Ball.Random.element(validAllies);
            let buff = source.world.addWorldObject(new Buff(source.x, source.y, randomAlly, { dmg, hp }, vec2(Random.sign() * 200, 0)));
            buff.addTag(Tags.DELAY_PLAY);
        }

        static loadFilter() {
            Texture.EFFECT_ONLY.renderTo(new BasicTexture(1, 1, 'MolecularDisassembler.loadFilter'), { filters: [new DisintegrateFilter()] });
        }
    }

    class DisintegrateFilter extends TextureFilter {
        private _amount: number;
        get amount() { return this._amount; }
        set amount(v) {
            if (this._amount === v) return;
            this._amount = v;
            this.setUniform('amount', M.clamp(v, 0, Infinity));
        }

        constructor() {
            super({
                uniforms: { 'float amount': 0 },
                code: `
                    float staticNoise = map(pnoise(x+0.3, y+0.15, t*100.0), -1.0, 1.0, 0.0, 1.0);
                    float staticF = step(staticNoise, 0.5);
                    outp.rgb = vec3(1.0, 1.0, 1.0) * staticF;

                    float alphaNoise = map(pnoise(x+10.7, y+7.25, 0.1), -1.0, 1.0, 0.0, 1.0);
                    float alphaF = step(alphaNoise, 1.0 - amount);
                    outp.a = inp.a * alphaF;
                `
            });

            this._amount = 0;
        }
    }
}
