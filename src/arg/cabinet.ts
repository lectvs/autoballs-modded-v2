class Cabinet extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            texture: 'arg/cabinet/closed',
            layer: ARG.Layers.onground,
            physicsGroup: ARG.PhysicsGroups.walls,
            bounds: new RectBounds(-14, -14, 27, 14),
            immovable: true,
        });
    }

    open() {
        this.setTexture('arg/cabinet/open');
        this.world.playSound('shake', { humanized: false }).volume = 0.6;
        this.world.runScript(S.shake(2, 0.1));
    }

    close() {
        this.setTexture('arg/cabinet/closed');
        this.world.playSound('shake', { humanized: false }).volume = 0.6;
        this.world.runScript(S.shake(2, 0.1));
    }
}