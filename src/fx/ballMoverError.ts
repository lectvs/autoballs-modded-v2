class BallMoverError extends SpriteText {
    constructor(x: number, y: number, err: string, life: number = 0.5) {
        super({
            x, y,
            text: err,
            font: 'smallnumbers',
            anchor: Vector2.CENTER,
            justify: 'center',
            effects: { outline: { color: 0x000000 }},
            layer: Battle.Layers.ui,
            life: life,
        });
    }

    update(): void {
        super.update();

        this.style.color = Color.lerpColorByLch(0xFF0000, 0xFFFFFF, Tween.Easing.OscillateSine(8)(this.life.time));
        this.alpha = M.lerp(1, 0, Tween.Easing.InQuad(this.life.progress));
        this.effects.outline.alpha = M.lerp(1, 0, Tween.Easing.InQuad(this.life.progress));
        this.y -= 6 * this.delta;
    }
}