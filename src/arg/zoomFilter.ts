class ZoomFilter extends TextureFilter {
    private _center: Vector2;
    get center() { return this._center; }
    set center(value: Vector2) {
        this._center = value;
        this.setUniform('center', [value.x, value.y]);
    }

    private _amount: number;
    get amount() { return this._amount; }
    set amount(value: number) {
        this._amount = value;
        this.setUniform('amount', value);
    }

    constructor(center: Vector2, amount: number) {
        super({
            uniforms: { 'vec2 center': [center.x, center.y], 'float amount': amount },
            code: `
                outp.rgb = vec3(0.0, 0.0, 0.0);
                for (float v = -2.0; v <= 2.0; v += 0.5) {
                    float zoomAmount = pow(2.0, (v - 0.1)*amount);
                    vec2 newp = (vec2(x, y) - center) / zoomAmount + center;
                    float fade = v == 0.0 ? 1.0 : pow(2.0, -abs(v)-2.0);
                    vec3 tint = vec3(1.0, 1.0-amount, 1.0-amount);
                    outp.rgb += getColor(newp.x, newp.y).rgb * fade * tint;
                }
            `
        });

        this._amount = amount;
        this._center = center;
    }
}