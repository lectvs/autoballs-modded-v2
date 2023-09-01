class BuffPlus extends Sprite {
    constructor(x: number, y: number, sign: '+' | '-') {
        super({
            x, y,
            texture: `buff${sign}`,
            effects: { outline: { color: 0x000000 } },
            layer: Battle.Layers.ui,
            life: 0.5,
        });
    }

    update() {
        super.update();
        this.localy -= 8 * this.delta;
        this.alpha = M.lerp(1, 0, Tween.Easing.InExp(this.life.progress));
        this.effects.outline.alpha = this.alpha;
    }
}