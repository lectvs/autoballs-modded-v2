class TutorialNextFilter extends TextureFilter {
    constructor() {
        super({
            uniforms: { 'vec3 tintColor': [1, 0, 0] },
            code: `
                outp.rgb *= tintColor;
            `
        });
    }

    setTintColor(tintColor: [number, number, number]) {
        this.setUniform('tintColor', tintColor);
    }
}