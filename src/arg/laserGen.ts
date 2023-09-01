class ArgLaserGen extends Sprite {
    private laser: ArgLaser;

    get enabled() { return this.laser.enabled; }

    constructor(x: number, y: number, dir: 'up' | 'down') {
        super({
            x, y,
            texture: `arg/lasergen/${dir}`,
            layer: ARG.Layers.main,
            physicsGroup: ARG.PhysicsGroups.walls,
            bounds: new RectBounds(-6, -11, 13, 11),
            immovable: true,
        });

        let dirv = dir === 'up' ? vec2(0, -1) : vec2(0, 1)

        this.laser = this.addChild(new ArgLaser(1 + dirv.x*6.5, -8.5 + dirv.y*5.5, dirv));
    }

    enable() {
        this.laser.enabled = true;
        this.world.playSound('arg/laser_start', { humanized: false });
    }

    disable() {
        this.laser.enabled = false;
    }
}

class ArgLaserGenUp extends ArgLaserGen {
    constructor(x: number, y: number) {
        super(x, y, 'up');
    }
}

class ArgLaserGenDown extends ArgLaserGen {
    constructor(x: number, y: number) {
        super(x, y, 'down');
    }
}