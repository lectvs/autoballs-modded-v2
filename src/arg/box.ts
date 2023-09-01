class ArgBox extends Sprite {
    private slideSound: Sound;

    private lasttx: number;
    private lastty: number;

    constructor(x: number, y: number) {
        super({
            x, y,
            texture: 'arg/box',
            layer: ARG.Layers.main,
            physicsGroup: ARG.PhysicsGroups.boxes,
            bounds: new RectBounds(-5, -10, 10, 10),
        });

        this.slideSound = new Sound('arg/box_slide');
        this.slideSound.loop = true;

        this.lasttx = this.x;
        this.lastty = this.y;
    }

    onAdd(): void {
        this.slideSound.controller = this.world.soundManager;
    }

    update(): void {
        super.update();

        if (this.x !== this.lasttx || this.y !== this.lastty) {
            this.slideSound.update(this.delta);
        }

        this.lasttx = this.x;
        this.lastty = this.y;
    }
}