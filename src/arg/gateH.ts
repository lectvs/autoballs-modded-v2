class ArgGateH extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            texture: `arg/gateh/0`,
            layer: ARG.Layers.main,
            physicsGroup: ARG.PhysicsGroups.walls,
            bounds: new RectBounds(-3, -46, 7, 46),
            immovable: true,
        });

        this.stateMachine.addState('closed', {
            callback: () => {
                this.setTexture('arg/gateh/0');
                this.colliding = true;
                if (this.life.time > 0.1) this.world.playSound('arg/securitydoor');
            },
        });

        this.stateMachine.addState('open', {
            callback: () => {
                this.setTexture('arg/gateh/1');
                this.colliding = false;
                if (this.life.time > 0.1) this.world.playSound('arg/securitydoor');
            },
        });

        this.setState('closed');
    }

    close() {
        this.setState('closed');
    }

    open() {
        this.setState('open');
    }
}