class Chester extends Player {
    get speed() { return this.grabbing ? 36 : 48; }

    constructor(x: number, y: number) {
        super(x, y, 'arg/chester');

        this.addAnimation(Animations.fromSingleTexture({ name: 'die', texture: 'arg/chester/44', oneOff: true }));

        this.behavior = new ControllerBehavior(function() {
            this.controller.left = Input.isDown('left');
            this.controller.right = Input.isDown('right');
            this.controller.up = Input.isDown('up');
            this.controller.down = Input.isDown('down');
            this.controller.keys.grab = Input.isDown('grab');
        });
    }
}