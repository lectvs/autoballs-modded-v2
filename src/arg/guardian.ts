class Guardian extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            animations: [
                Animations.fromTextureList({ name: 'idle_front', textureRoot: 'arg/guardian', textures: [0, 1], frameRate: 5, count: Infinity }),
            ],
            defaultAnimation: 'idle_front',
            alpha: 0.2,
            //effects: { outline: { color: 0xFFFFFF }, post: { filters: [new Effects.Filters.Outline(0x000000, 1)] }},
            layer: ARG.Layers.main,
        });
    }
}