class OptionsSlider extends Sprite {
    centerX: number;
    barLength: number;
    minValue: number;
    maxValue: number;
    getValue: Getter<number>;
    setValue: Setter<number>;

    private slider: Sprite;
    private grabbing: boolean = false;
    private lastHovered: boolean = false;

    constructor(centerX: number, y: number, barLength: number, minValue: number, maxValue: number, getValue: Getter<number>, setValue: Setter<number>) {
        super({
            x: centerX, y,
            texture: 'sliderbar',
            bounds: new RectBounds(-barLength/2 - 4, -6, barLength + 8, 12),
        });

        this.centerX = centerX;
        this.barLength = barLength;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.getValue = getValue;
        this.setValue = setValue;

        this.slider = this.addChild(new Sprite({
            x: this.valueToWorldX(this.getValue()) - centerX,
            texture: 'slider',
        }));
    }

    update(): void {
        super.update();

        let mousePos = this.world.getWorldMousePosition();
        let hovered = this.bounds.containsPoint(mousePos);

        if (hovered && Input.justDown('click')) {
            global.game.playSound('click');
            this.grabbing = true;
        }

        if (Input.isUp('click')) {
            if (this.grabbing) global.game.playSound('click');
            this.grabbing = false;
        }

        if (this.grabbing) {
            this.tint = 0xBBBB00;
            this.slider.tint = 0xBBBB00;
            this.slider.x = M.clamp(mousePos.x, this.centerX - this.barLength/2, this.centerX + this.barLength/2);
            this.setValue(this.worldXToValue(this.slider.x));
        } else if (hovered) {
            this.tint = 0xFFFF00;
            this.slider.tint = 0xFFFF00;
            if (!this.lastHovered) {
                juiceObject(this, 0.5);
                juiceObject(this.slider, 3);
            }
        } else {
            this.tint = 0xFFFFFF;
            this.slider.tint = 0xFFFFFF;
        }

        this.lastHovered = hovered;
    }

    private worldXToValue(x: number) {
        return M.map(x, this.centerX - this.barLength/2, this.centerX + this.barLength/2, this.minValue, this.maxValue);
    }

    private valueToWorldX(value: number) {
        return M.map(value, this.minValue, this.maxValue, this.centerX - this.barLength/2, this.centerX + this.barLength/2);
    }
}