class HueSpinFilter extends TextureFilter {
    constructor() {
        super({
            uniforms: {},
            code: `
                vec3 hsv = rgb2hsv(inp.rgb);
                hsv.x += t;
                outp = vec4(hsv2rgb(hsv), inp.a);
            `
        });
    }
}