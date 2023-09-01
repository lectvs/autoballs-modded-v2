class ArenaBdayShadeFilter extends TextureFilter {
    private _amount: number;
    get amount() { return this._amount; }
    set amount(v) {
        if (this._amount === v) return;
        this._amount = v;
        this.setUniform('amount', M.clamp(v, 0, Infinity));
    }

    constructor() {
        super({
            uniforms: { 'float amount': 0 },
            code: `
                float dx = x - width * 0.5;
                float dy = y - height * 0.5;
                float distance = sqrt(dx*dx + dy*dy);

                float angle = atan(dy, dx) + distance * 0.01 - t * 0.2;

                float radius = amount * (60.0 + 10.0 * pnoise(4.0 * cos(angle), 4.0 * sin(angle), 0.8));
                float p = clamp(map(distance, 0.0, radius, 0.9, 0.0), 0.0, 0.9);

                outp.rgb = lerp(outp.rgb, vec3(0.0, 0.0, 0.0), p);
            `
        });

        this._amount = 0;
    }
}