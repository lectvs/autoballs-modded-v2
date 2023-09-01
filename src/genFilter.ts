class GenFilter extends TextureFilter {
    constructor() {
        super({
            code: `
                float dx = x - 160.0;
                float dy = y - 120.0;

                vec2 v = normalize(vec2(-dy, dx));

                float r = (v.x + 1.0) / 2.0;
                float g = (v.y + 1.0) / 2.0;
                float b = 128.0 / 255.0;

                outp.rgb = vec3(r, g, b);
            `
        });
    }
}