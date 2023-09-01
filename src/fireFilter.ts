class FireFilter extends TextureFilter {

    private _angle: number;
    get angle() { return this._angle; }
    set angle(v) {
        this._angle = v;
        this.setUniform('angle', v);
    }

    private _length: number;
    get length() { return this._length; }
    set length(v) {
        this._length = v;
        this.setUniform('length', v);
    }

    constructor() {
        super({
            uniforms: { 'float toffset': Random.float(0, 1), 'float angle': 0, 'float length': 1 },
            code: `
                float ou = map(x / width, 1.0/3.0, 2.0/3.0, -0.5, 0.5);
                float ov = map(y / height, 1.0/3.0, 2.0/3.0, -0.5, 0.5);

                float s = sin(angle * PI / 180.0);
                float c = cos(angle * PI / 180.0);
                float u = c*ou - s*ov;
                float v = s*ou + c*ov;

                float noise = map(pnoise(u*4.25, v*4.25 + (t + toffset)*5.0, 20.3), -1.0, 1.0, 0.0, 1.0);

                float gradient = mapClamp(v, -1.1, -0.3, 0.0, 1.0);

                float l1 = 0.35 * length;
                float l2 = 0.65 * length;

                float base = mapClamp(sqrt(u*u + v*v), 0.5, 0.45, 0.0, 1.0);
                float flame1 = mapClamp(sqrt(u*u + (v+l1)*(v+l1)), 0.5, 0.3, 0.0, 1.0);
                float flame2 = mapClamp(sqrt(u*u + (v+l2)*(v+l2)), 0.3, 0.2, 0.0, 1.0);

                float total = clamp(base + flame1 + flame2, 0.0, 1.0) * gradient;

                float step1 = step(noise, total);

                outp.a = step1 * inp.a;

                if (u < -0.5 || u > 0.5 || v < -1.0 || v > 0.5) outp.a = 0.0;
            `
        });

        this.angle = 0;
        this.length = 1;
    }
}