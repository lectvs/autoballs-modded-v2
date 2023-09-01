class BubbleMaker extends WorldObject {
    constructor(x: number, y: number, d: number) {
        super({
            x, y,
        });

        this.runScript(S.loopFor(Infinity, i => S.chain(
            S.wait(Random.float(0, 1)),
            S.call(() => this.spawnBubble(d)),
            S.wait(Random.float(0, 2)),
        )));
    }

    spawnBubble(d: number) {
        this.world.addWorldObject(new Sprite({
            x: this.x + Random.int(-1, 1), y: this.y, z: 24,
            texture: new AnchoredTexture(Texture.outlineCircle(2, 0x000000), 0.5, 0.5),
            layer: ARG.Layers.main,
            vx: Random.float(0, 2) * d,
            vz: 10,
            gravityz: 20,
            life: 1,
        }));
    }
}