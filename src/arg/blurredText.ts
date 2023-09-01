class BlurredText extends SpriteText {
    private blur: StaticFilter;

    constructor(x: number, y: number, text: string, color: number) {
        super({
            x, y, text,
            anchor: Vector2.CENTER,
            justify: 'center',
            style: { color: color },
        });

        this.blur = new StaticFilter(color);
        this.effects.post.filters.push(this.blur);
    }

    update() {
        super.update();
        this.blur.setUniform('alpha', this.alpha);
    }

    setBlurAmount(amount: number) {
        this.blur.setUniform('amount', amount);
    }
}