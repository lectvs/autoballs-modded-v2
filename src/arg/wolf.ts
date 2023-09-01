class Wolf extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            animations: [
                Animations.fromTextureList({ name: 'idle_front', textureRoot: 'arg/wolf', textures: [0, 1], frameRate: 2.5, count: Infinity }),
            ],
            defaultAnimation: 'idle_front',
            effects: { outline: { color: 0x000000 }},
            layer: ARG.Layers.main,
        });
    }
}