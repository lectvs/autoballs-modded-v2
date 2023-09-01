class ArgAutoBalls extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            animations: [
                Animations.fromTextureList({ name: 'play', textureRoot: 'arg/autoballs', textures: [0, 1, 2, 3, 4, 5, 6, 7], frameRate: 10, count: Infinity }),
            ],
            defaultAnimation: 'play',
            layer: ARG.Layers.main,
            physicsGroup: ARG.PhysicsGroups.walls,
            bounds: new RectBounds(-10, -17, 20, 17),
            immovable: true,
        });
    }
}