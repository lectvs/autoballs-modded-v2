class AddBlueFilter extends TextureFilter {
    private _amount: number;
    get amount() { return this._amount; }
    set amount(v) {
        if (this._amount === v) return;
        this._amount = v;
        this.setUniform('amount', M.clamp(v, 0, Infinity));
    }

    constructor(amount: number) {
        super({
            uniforms: { 'float amount': amount },
            code: `
                outp.rgb = inp.rgb + amount * vec3(0.0, 0.2, 0.4);
            `
        });

        this._amount = amount;
    }
}