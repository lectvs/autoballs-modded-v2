class ArgButton extends Sprite {
    onDown: () => void;
    onUp: () => void;

    constructor(x: number, y: number) {
        super({
            x, y,
            texture: 'arg/button/0',
            layer: ARG.Layers.onground,
            bounds: new RectBounds(-4, -10, 8, 8),
        });

        this.stateMachine.addState('up', {
            callback: () => {
                this.setTexture('arg/button/0');
                if (this.life.time > 0.1) this.world.playSound('arg/pressureplate');
                if (this.onUp) this.onUp();
            },
            transitions: [{ toState: 'down', condition: () => this.isPressed() }]
        });

        this.stateMachine.addState('down', {
            callback: () => {
                this.setTexture('arg/button/1');
                if (this.life.time > 0.1) this.world.playSound('arg/pressureplate');
                if (this.onDown) this.onDown();
            },
            transitions: [{ toState: 'up', condition: () => !this.isPressed() }]
        });

        this.setState('up');
    }

    private isPressed() {
        return this.world.select.overlap(this.bounds, [ARG.PhysicsGroups.player, ARG.PhysicsGroups.boxes]).length > 0;
    }
}