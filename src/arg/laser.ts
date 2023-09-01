class ArgLaser extends WorldObject {
    dir: Vector2;
    endpoint: Vector2;
    enabled: boolean;

    private laserSound: Sound;

    constructor(x: number, y: number, dir: Vector2) {
        super({
            x, y,
            layer: ARG.Layers.main,
        });

        this.dir = vec2(dir);
        this.endpoint = vec2(this.x, this.y);
        this.enabled = false;

        this.laserSound = new Sound('arg/laser');
        this.laserSound.loop = true;
    }

    onAdd(): void {
        this.laserSound.controller = this.world.soundManager;
    }

    update(): void {
        super.update();

        this.endpoint.set(this.x, this.y);

        let raycasts = this.getRaycasts();
        if (raycasts.length > 0 && raycasts[0].t > 0) {
            this.endpoint.add(this.dir.scale(raycasts[0].t));
        }

        if (this.enabled) this.laserSound.update(this.delta);
    }

    render(texture: Texture, x: number, y: number): void {
        if (this.enabled) {
            let ex = x + this.endpoint.x - this.x;
            let ey = y + this.endpoint.y - this.y;
    
            Draw.brush.color = 0xFF0000;
            Draw.brush.alpha = 1;
            Draw.brush.thickness = 1;
            Draw.line(texture, x, y, ex, ey);
        }

        super.render(texture, x, y);
    }

    isActivating(laserRec: ArgLaserRec) {
        if (!this.enabled) return false;
        let raycasts = this.getRaycasts();
        return raycasts.length > 0 && raycasts[0].obj === laserRec;
    }
    
    private getRaycasts() {
        return this.world.select.raycast(this.x, this.y, this.dir.x, this.dir.y, [ARG.PhysicsGroups.boxes, ARG.PhysicsGroups.player, ARG.PhysicsGroups.walls])
                                .filter(rc => {
                                    if (rc.obj instanceof ArgLaserGen) return false;
                                    if (rc.obj instanceof ArgGateV && rc.obj.state === 'open') return false;
                                    return true;
                                });
    }
}