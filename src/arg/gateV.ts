class ArgGateV extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            texture: `arg/gatev/0`,
            layer: ARG.Layers.main,
            physicsGroup: ARG.PhysicsGroups.walls,
            bounds: new RectBounds(-16, -8, 32, 8),
            immovable: true,
        });

        this.stateMachine.addState('closed', {
            callback: () => {
                this.setTexture('arg/gatev/0');
                this.colliding = true;
                if (this.life.time > 0.1) this.world.playSound('arg/securitydoor');
            },
        });

        this.stateMachine.addState('open', {
            callback: () => {
                this.setTexture('arg/gatev/1');
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