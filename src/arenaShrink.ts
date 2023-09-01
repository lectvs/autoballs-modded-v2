class ArenaShrink extends PhysicsWorldObject {
    private invertedBounds: InvertedRectBounds;

    private maxPadX = 66;
    private maxPadY = 50;

    constructor() {
        super({
            layer: Battle.Layers.walls,
            physicsGroup: Battle.Layers.walls,
            immovable: true,
        });

        this.bounds = this.invertedBounds = new InvertedRectBounds(0, 0, global.gameWidth, global.gameHeight);
    }

    update(): void {
        super.update();

        let p = 0;
        let battleTimer = this.world.select.type(BattleTimer, false);
        if (battleTimer) {
            p = M.mapClamp(battleTimer.battleTimeForArenaShrink, 30, 45, 0, 1);
        }

        this.invertedBounds.x = M.lerp(0, this.maxPadX, p);
        this.invertedBounds.y = M.lerp(0, this.maxPadY, p);
        this.invertedBounds.width = M.lerp(global.gameWidth, global.gameWidth - 2*this.maxPadX, p);
        this.invertedBounds.height = M.lerp(global.gameHeight, global.gameHeight - 2*this.maxPadY, p);
    }

    render(texture: Texture, x: number, y: number): void {
        let box = this.invertedBounds.getInnerBox();

        Draw.brush.color = 0x000000;
        Draw.brush.alpha = 1;

        Draw.rectangleSolid(texture, x, y, global.gameWidth, box.top);
        Draw.rectangleSolid(texture, x, y, box.left, global.gameHeight);
        Draw.rectangleSolid(texture, x + box.right, y, global.gameWidth - box.right, global.gameHeight);
        Draw.rectangleSolid(texture, x, y + box.bottom, global.gameWidth, global.gameHeight - box.bottom);

        super.render(texture, x, y);
    }
}