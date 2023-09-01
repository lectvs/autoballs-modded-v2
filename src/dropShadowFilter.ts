class DropShadowFilter extends TextureFilter {
    constructor() {
        super({
            code: `
                float a = getColor(x-1.0, y-1.0).a;
                if (inp.a == 0.0 && a > 0.0) {
                    outp = vec4(0.0, 0.0, 0.0, 0.5 * a);
                }
            `
        });
    }
}