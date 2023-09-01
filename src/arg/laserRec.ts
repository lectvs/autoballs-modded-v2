class ArgLaserRec extends Sprite {
    onActive: () => void;
    onInactive: () => void;

    constructor(x: number, y: number, dir: 'down' | 'up') {
        super({
            x, y: y-3,
            texture: `arg/laserrec/${dir}/off`,
            layer: ARG.Layers.main,
            physicsGroup: ARG.PhysicsGroups.walls,
            bounds: new RectBounds(-6, -12, 13, 13),
            immovable: true,
        });

        this.stateMachine.addState('inactive', {
            callback: () => {
                this.setTexture(`arg/laserrec/${dir}/off`);
                if (this.life.time > 0.1) this.world.playSound('arg/lasergate');
                if (this.onInactive) this.onInactive();
            },
            transitions: [{ toState: 'active', condition: () => this.isActivated() }]
        });

        this.stateMachine.addState('active', {
            callback: () => {
                this.setTexture(`arg/laserrec/${dir}/on`);
                if (this.life.time > 0.1) this.world.playSound('arg/lasergate');
                if (this.onActive) this.onActive();
            },
            transitions: [{ toState: 'inactive', condition: () => !this.isActivated() }]
        });

        this.setState('inactive');
    }

    private isActivated() {
        if (!this.world) return false;
        return this.world.select.typeAll(ArgLaser).some(laser => laser.isActivating(this));
    }
}

class ArgLaserRecUp extends ArgLaserRec {
    constructor(x: number, y: number) {
        super(x, y, 'up');
    }
}

class ArgLaserRecDown extends ArgLaserRec {
    constructor(x: number, y: number) {
        super(x, y, 'down');
    }
}