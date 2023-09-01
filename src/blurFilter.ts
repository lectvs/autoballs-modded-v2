class BlurFilter extends TextureFilter {
    private _strength: number;
    get strength() { return this._strength; }
    set strength(value: number) {
        this._strength = value;
        this.setUniform('strength', value);
    }

    constructor(strength: number) {
        let samples_f = `40.0`;
        super({
            uniforms: {
                'float strength': strength,
            },
            code: `
                outp = vec4(0.0, 0.0, 0.0, 0.0);
                for (float angle = 0.0; angle < 2.0*PI; angle += PI/2.0/${samples_f}) {
                    float distance = 0.0;
                    for (float i = 0.0; i < ${samples_f}; i++) {
                        distance += strength / ${samples_f};
                        outp += getColor(clamp(x + distance * cos(angle), 0.0, width-1.0), clamp(y + distance * sin(angle), 0.0, height-1.0));
                    }
                }
                outp /= 4.0 * ${samples_f} * ${samples_f};
            `
        });

        this._strength = strength;
    }

    static load() {
        Texture.EFFECT_ONLY.renderTo(new BasicTexture(1, 1, 'BlurFilter.load'), { filters: [new BlurFilter(26.7)] });
    }
}