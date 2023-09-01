class RevealFilter extends TextureFilter {
    private _amount: number;
    get amount() { return this._amount; }
    set amount(value: number) {
        this._amount = value;
        this.setUniform('amount', value);
    }

    constructor(amount: number) {
        super({
            uniforms: { 'float amount': amount },
            code: `
                float pn = map(pnoise(x/12.0, y/12.0, 10.6), -1.0, 1.0, 0.0, 1.0);
                float a = amount * 1.2;
                if (pn >= a) {
                    outp.a = 0.0;
                } else if (pn > a - 0.1) {
                    outp.a *= map(pn, a, a - 0.1, 0.0, 1.0);
                }
            `
        });

        this._amount = amount;
    }
}