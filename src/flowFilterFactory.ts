class FlowFilterFactory extends TextureFilter {
    constructor() {
        super({
            code: `
                float theta = atan(y - height/2.0, x - width/2.0);

                float light = mod(theta/PI*1.0 - 0.2*t, 1.0);

                outp.rgb = outp.rgb * lerp(0.3, 1.0, light);
            `
        });
    }
}