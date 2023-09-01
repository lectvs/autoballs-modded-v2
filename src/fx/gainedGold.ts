class GainedGold extends SpriteText {
    private dir: 'up' | 'down';

    constructor(x: number, y: number, gold: number, dir: 'up' | 'down') {
        super({
            x, y,
            text: `[gold]<coin>${gold}[/gold]`,
            anchor: Vector2.CENTER,
            effects: { outline: { color: 0x000000 } },
            layer: Battle.Layers.ui,
            life: 0.5,
        });

        this.dir = dir;
    }

    update() {
        super.update();
        this.localy += 12 * this.delta * (this.dir === 'up' ? -1 : 1);
        this.alpha = M.lerp(1, 0, Tween.Easing.InExp(this.life.progress));
        this.effects.outline.alpha = this.alpha;
    }
}