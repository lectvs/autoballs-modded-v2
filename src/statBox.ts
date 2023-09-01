class StatBox extends Sprite {
    private type: 'dmg' | 'hp';
    private text: string;
    private color: number;

    constructor(type: 'dmg' | 'hp') {
        super({
            copyFromParent: ['layer'],
        });
        this.type = type;
        this.setText('0');
    }

    setText(text: string) {
        this.text = text;
        this.setTexture(StatBox.cache[this.type].get(this.text).get(this.color));
    }

    setColor(color: number) {
        this.color = color;
        this.setTexture(StatBox.cache[this.type].get(this.text).get(this.color));
    }

    private static cache = {
        'dmg': new LazyDict(value => new LazyDictNumber(color => StatBox.newTexture('dmg', value, color))),
        'hp': new LazyDict(value => new LazyDictNumber(color => StatBox.newTexture('hp', value, color))),
    };

    private static newTexture(type: 'dmg' | 'hp', value: string, color: number) {
        let spriteText = new SpriteText({
            text: value,
            font: 'smallnumbers',
            anchor: Vector2.CENTER,
            effects: { outline: { color: 0x000000 } },
            style: { color: color },
        });
        let texture = new BasicTexture(Math.max(spriteText.getTextWidth()+1, 9), 7, `StatBox.cache.${type}`, false);
        AssetCache.getTexture(`${type}box`).renderTo(texture, { x: (texture.width-1)/2, y: 3 });
        spriteText.render(texture, (texture.width-1)/2+1, 4);
        texture.immutable = true;
        return new AnchoredTexture(texture, 0.5, 0.5);
    }
}