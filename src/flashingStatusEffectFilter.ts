class FlashingStatusEffectFilter extends TextureFilter {
    private _amount: number;
    get amount() { return this._amount; }
    set amount(value: number) {
        this._amount = value;
        this.setUniform('amount', value);
    }

    private _color: number;
    get color() { return this._color; }
    set color(value: number) {
        this._color = value;
        this.setUniform('color', M.colorToVec3(value));
    }

    constructor() {
        super({
            uniforms: { 'float amount': 0, 'vec3 color': [1, 1, 1] },
            code: `
                float blendAmount = amount * map(sin(40.0*t), -1.0, 1.0, 0.2, 1.0);
                outp.rgb = outp.rgb * (1.0 - blendAmount) + color * blendAmount;
            `
        });

        this._amount = 0;
        this._color = 0xFFFFFF;
    }
}