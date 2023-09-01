var ballTextureCache: Dict<Texture[]> = {};
function getBallTextures(base: string) {
    if (base in ballTextureCache) return ballTextureCache[base];

    let baseTexture = AssetCache.getTexture(base);
    if (!baseTexture) return [];

    let ballRollFilter = new BallRollFilter();
    let textures: Texture[] = [];

    for (let i = 0; i < 20; i++) {
        ballRollFilter.angle = 2*Math.PI / 20 * i;
        textures.push(baseTexture.transform({ filters: [ballRollFilter] }, 'getBallTextures'));
    }

    ballTextureCache[base] = textures;
    return textures;
}

class BallRollFilter extends TextureFilter {
    private _angle: number;
    get angle() { return this._angle; }
    set angle(value: number) {
        if (this._angle !== value) this.setUniform('angle', value);
        this._angle = value;
    }

    constructor() {
        super({
            uniforms: { 'float angle': 0 },
            code: `
                if (0.0 <= y && y <= height) {
                    float pixel = angle / TWOPI * height;
                    outp = getColor(x, mod(y + pixel, height));
                }
            `
        });

        this._angle = 0;
    }
}

class BallTeamColorFilter extends TextureFilter {
    constructor(color: number) {
        super({
            uniforms: { 'vec3 color': M.colorToVec3(color) },
            code: `
                vec3 normalColor = vec3(1.0, 1.0, 1.0) * 128.0 / 255.0;
                if (abs(outp.r - normalColor.r) <= 0.016 && abs(outp.g - normalColor.g) <= 0.016 && abs(outp.b - normalColor.b) <= 0.016) {
                    outp.rgb = color;
                }

                vec3 darkColor = vec3(1.0, 1.0, 1.0) * 64.0 / 255.0;
                if (abs(outp.r - darkColor.r) <= 0.016 && abs(outp.g - darkColor.g) <= 0.016 && abs(outp.b - darkColor.b) <= 0.016) {
                    outp.rgb = mix(color, vec3(0.0, 0.0, 0.0), 0.5);
                }

                vec3 lightColor = vec3(1.0, 1.0, 1.0) * 191.0 / 255.0;
                if (abs(outp.r - lightColor.r) <= 0.016 && abs(outp.g - lightColor.g) <= 0.016 && abs(outp.b - lightColor.b) <= 0.016) {
                    outp.rgb = mix(color, vec3(1.0, 1.0, 1.0), 0.5);
                }
            `
        });
    }

    setColor(color: number) {
        this.setUniform('color', M.colorToVec3(color));
    }
}