class Stars extends Sprite {
    private type: 'stars' | 'crowns';

    constructor(type: 'stars' | 'crowns') {
        super({
            copyFromParent: ['layer'],
        });

        this.type = type;
    }

    setStars(stars: number) {
        let cache = this.type === 'stars' ? Stars.starsCache : Stars.crownsCache;
        this.setTexture(cache.get(stars));
    }

    private static starsCache = new LazyDictNumber(stars => Stars.newTexture(stars, 'stars'));
    private static crownsCache = new LazyDictNumber(stars => Stars.newTexture(stars, 'crowns'));

    private static newTexture(stars: number, type: 'stars' | 'crowns') {
        let starTexture = AssetCache.getTexture(type === 'stars' ? 'star' : 'crown');

        if (stars < 7) {
            let texture = new BasicTexture(10*stars, 9, `Stars.${type}Cache`, false);
            for (let i = 0; i < stars; i++) {
                starTexture.renderTo(texture, { x: 5 + 10*i, y: 4 });
            }
            texture.immutable = true;
            return new AnchoredTexture(texture, 0.5, 0.5);
        }

        let starsString = `${stars}`;
        let texture = new BasicTexture(10 + 8*starsString.length, 11, `Stars.${type}Cache`, false);

        starTexture.renderTo(texture, { x: 5, y: 5 });
        new SpriteText({
            text: starsString,
            font: 'starnumbers',
            style: { color: 0xFFD800 },
            effects: { outline: { color: 0x000000 } },
        }).render(texture, 10, 2);
        texture.immutable = true;
        return new AnchoredTexture(texture, 0.5, 0.5);
    }
}