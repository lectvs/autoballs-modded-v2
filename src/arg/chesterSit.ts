class ChesterSit extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            animations: [
                Animations.fromTextureList({ name: 'idle_sit', textureRoot: 'arg/chester', textures: [42, 43], frameRate: 1.1, count: Infinity }),
            ],
            defaultAnimation: 'idle_sit',
            effects: { outline: { color: 0x000000 }},
            layer: ARG.Layers.main,
        });
    }
}