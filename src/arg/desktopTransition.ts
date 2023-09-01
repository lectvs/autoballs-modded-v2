class DesktopTransitionFilter extends TextureFilter {
    private _amount: number;
    get amount() { return this._amount; }
    set amount(v) {
        if (this._amount === v) return;
        this._amount = v;
        this.setUniform('amount', v);
    }

    constructor(offset: number = 0) {
        super({
            uniforms: { 'float amount': 0, 'float offset': offset },
            code: `
                float offsetY = y + offset;
                float percent = (mod(floor(offsetY), 4.0) + offsetY/height) / 4.0;

                outp.rgb = step(percent, amount) * inp.rgb;
            `
        });

        this._amount = 0;
    }
}

class DesktopTransitionObject extends WorldObject {
    constructor(speed: 'normal' | 'fast' = 'normal') {
        super({
            timeScale: speed === 'fast' ? 1.5 : 1,
        });
    }

    onAdd(): void {
        super.onAdd();

        let filter = new DesktopTransitionFilter();
        this.world.effects.post.filters.push(filter);
        this.runScript(S.chain(
            S.tween(1, filter, 'amount', 0, 1),
            S.call(() => {
                A.removeAll(this.world.effects.post.filters, filter);
                this.kill();
            }),
        ));
    }
}