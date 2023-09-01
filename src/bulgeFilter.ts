class BulgeFilter extends TextureFilter {
    private _bulgeAmount: number;
    get bulgeAmount() { return this._bulgeAmount; }
    set bulgeAmount(v) {
        if (this._bulgeAmount === v) return;
        this._bulgeAmount = v;
        this.setUniform('bulgeAmount', v);
    }

    constructor(bulgeAmount: number, radiusScale: number = 1) {
        super({
            uniforms: { 'float bulgeAmount': bulgeAmount, 'float radiusScale': radiusScale },
            code: `
                float dx = x - width/2.0;
                float dy = y - height/2.0;
                float distance = sqrt(dx*dx + dy*dy) + 0.00001;

                float radius = max(width/2.0, height/2.0);

                float bulgeFactor = max(distance / radius, pow(distance / radius / radiusScale, 1.0 - bulgeAmount) * radiusScale);

                float newX = width/2.0 + dx * radius * bulgeFactor / distance;
                float newY = height/2.0 + dy * radius * bulgeFactor / distance;

                outp = getColor(mod(newX, width), mod(newY, height));
            `
        });

        this._bulgeAmount = bulgeAmount;
    }
}