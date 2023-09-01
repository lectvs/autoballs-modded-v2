class ShineFilter extends TextureFilter {
    constructor(color: number) {
        super({
            uniforms: { 'vec3 shineColor': M.colorToVec3(color) },
            code: `
                float xyt = 0.5*x + y - 80.0*t;
                float p = floor(0.341 * sin(0.03*xyt) + 0.66);
                outp.rgb = p * shineColor + (1.0-p) * outp.rgb;
            `
        });
    }
}