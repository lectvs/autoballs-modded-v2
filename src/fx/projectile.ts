class Projectile extends Sprite {
    source: Ball;

    constructor(source: Ball, config: Sprite.Config) {
        super(config);
        this.source = source;
    }
}