/// <reference path="./player.ts" />

class Bec extends Player {
    get speed() { return this.grabbing ? 36 : 48; }

    constructor(x: number, y: number) {
        super(x, y, 'arg/bec');

        this.addAnimation(Animations.fromTextureList({ name: 'reach', textureRoot: 'arg/bec', textures: [42, 43, 44, 45, 45, 45, 46, 45, 46, 45, 46, 45, 44, 43, 42], frameRate: 4, count: 1, oneOff: true, overrides: {
            1: { callback: () => this.world.playSound('arg/reach', { humanized: false }) },
            3: { callback: () => this.world.playSound('arg/reach', { humanized: false }) },
            6: { callback: () => this.world.playSound('arg/unlock', { humanized: false }) },
            8: { callback: () => this.world.playSound('arg/unlock', { humanized: false }) },
        }}));

        this.behavior = new ControllerBehavior(function() {
            this.controller.left = Input.isDown('left');
            this.controller.right = Input.isDown('right');
            this.controller.up = Input.isDown('up');
            this.controller.down = Input.isDown('down');
            this.controller.keys.grab = Input.isDown('grab');
        });
    }
}