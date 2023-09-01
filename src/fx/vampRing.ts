class VampRing extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            animations: [Animations.fromTextureList({ name: 'default', textureRoot: 'vampring', textures: [0, 1], frameRate: 12, count: Infinity })],
            defaultAnimation: 'default',
            tint: 0xDD0000,
        });
    }
}