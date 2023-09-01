class ArenaFirstFilter extends TextureFilter {
    constructor() {
        super({
            code: `
                if (x > 8.0 && x < width-9.0 && y > 8.0 && y < height-9.0 && inp.a > 0.0) {

                    bool topLeft = convolute44(x, y, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0)
                                || convolute44(x, y, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0)
                                || convolute44(x, y, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0);

                    bool topRight = convolute44(x-3.0, y, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0)
                                 || convolute44(x-3.0, y, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0)
                                 || convolute44(x-3.0, y, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);

                    bool bottomLeft = convolute44(x, y-3.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
                                   || convolute44(x, y-3.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0)
                                   || convolute44(x, y-3.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0);

                    bool bottomRight = convolute44(x-3.0, y-3.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
                                    || convolute44(x-3.0, y-3.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
                                    || convolute44(x-3.0, y-3.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0);

                    if (getColor(x-1.0, y).a > 0.0 && getColor(x+1.0, y).a > 0.0 && getColor(x, y-1.0).a > 0.0 && getColor(x, y+1.0).a > 0.0
                            && (getColor(x-2.0, y).a == 0.0 || getColor(x+2.0, y).a == 0.0 || getColor(x, y-2.0).a == 0.0 || getColor(x, y+2.0).a == 0.0)) {
                        outp.rgb = vec3(1.0, 1.0, 1.0);
                    }

                    if (topLeft || topRight || bottomLeft || bottomRight) {
                        outp.rgb = vec3(1.0, 1.0, 1.0);
                    }
                }
            `
        });
    }

    static load() {
        Texture.EFFECT_ONLY.renderTo(new BasicTexture(1, 1, 'ArenaFirstFilter.load'), { filters: [new ArenaFirstFilter()] });
    }
}